import { createDatabase } from '../src/server/db';
import { OperatorClient } from '../src/server/operator';
import { RechargeService } from '../src/server/service';

const operator: OperatorClient = {
  submit: jest.fn(async () => ({ requestId: 'operator-request-1' })),
  checkStatus: jest.fn(async () => 'SUCCESS'),
};

describe('recharge service', () => {
  it('makes a double submit with one idempotency key debit once', async () => {
    const db = createDatabase();
    const service = new RechargeService(db, operator);
    const payload = { number: '+919876543210', operator: 'DemoTel', amount: 100 };
    const first = service.createRecharge({ ...payload, idempotencyKey: 'same-key' });
    const second = service.createRecharge({ ...payload, idempotencyKey: 'same-key' });

    expect(second.id).toBe(first.id);
    expect((db.prepare("SELECT COUNT(*) AS count FROM ledger WHERE entry_type = 'DEBIT'").get() as { count: number }).count).toBe(1);
    expect(service.getWallet().balance).toBe(900);
    db.close();
  });

  it('refunds once when the same failure webhook is delivered twice', async () => {
    const db = createDatabase();
    const service = new RechargeService(db, operator);
    const created = service.createRecharge({ number: '+919876543210', operator: 'DemoTel', amount: 50, idempotencyKey: 'failure-key' });
    const webhook = { eventId: 'event-1', rechargeId: created.id, result: 'FAILED' as const };
    service.processWebhook(webhook);
    service.processWebhook(webhook);

    expect(service.listRecharges()[0].status).toBe('REFUNDED');
    expect(service.getWallet().balance).toBe(1000);
    expect((db.prepare("SELECT COUNT(*) AS count FROM ledger WHERE entry_type = 'CREDIT'").get() as { count: number }).count).toBe(1);
    db.close();
  });

  it('ignores a late success callback after a failure refund', async () => {
    const db = createDatabase();
    const service = new RechargeService(db, operator);
    const created = service.createRecharge({ number: '+919876543210', operator: 'DemoTel', amount: 25, idempotencyKey: 'order-key' });
    service.processWebhook({ eventId: 'failure', rechargeId: created.id, result: 'FAILED' });
    service.processWebhook({ eventId: 'late-success', rechargeId: created.id, result: 'SUCCESS' });
    expect(service.getRecharge(created.id).status).toBe('REFUNDED');
    expect(service.listCallbackAnomalies()).toEqual([
      expect.objectContaining({
        recharge_id: created.id,
        existing_status: 'REFUNDED',
        incoming_result: 'SUCCESS',
      }),
    ]);
    db.close();
  });

  it('keeps a timed-out submission pending until reconciliation confirms failure', async () => {
    const db = createDatabase();
    const timeoutOperator: OperatorClient = {
      submit: jest.fn(async () => {
        const error = new Error('operator request timed out') as Error & { requestId?: string };
        error.requestId = 'timed-out-request';
        throw error;
      }),
      checkStatus: jest.fn(async () => 'FAILED'),
    };
    const service = new RechargeService(db, timeoutOperator, 0);
    const created = service.createRecharge({ number: '+919876543210', operator: 'DemoTel', amount: 40, idempotencyKey: 'timeout-key' });

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(service.getRecharge(created.id).status).toBe('PENDING');
    expect(service.getWallet().balance).toBe(960);

    await service.reconcile();
    expect(service.getRecharge(created.id).status).toBe('REFUNDED');
    expect(service.getWallet().balance).toBe(1000);
    expect(timeoutOperator.checkStatus).toHaveBeenCalledWith('timed-out-request');
    db.close();
  });
});
