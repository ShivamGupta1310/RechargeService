import { randomUUID } from 'crypto';
import { DatabaseConnection } from './db';
import { OperatorClient } from './operator';
import { OperatorResult, OrderStatus, Recharge, RechargeInput } from './types';

const toCents = (amount: number) => Math.round(amount * 100);

export class RechargeService {
  constructor(
    private readonly db: DatabaseConnection,
    private readonly operator: OperatorClient,
    private readonly pendingTimeoutMs = 5 * 60 * 1000,
  ) {}

  createRecharge(input: RechargeInput): Recharge {
    if (!/^\+?[1-9]\d{9,14}$/.test(input.number)) throw new Error('invalid mobile number');
    if (!input.operator.trim()) throw new Error('operator is required');
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('amount must be positive');
    if (!input.idempotencyKey.trim()) throw new Error('idempotency key is required');

    const amountCents = toCents(input.amount);
    const existing = this.db
      .prepare('SELECT * FROM recharges WHERE idempotency_key = ?')
      .get(input.idempotencyKey) as Record<string, unknown> | undefined;
    if (existing) {
      if (
        existing.number !== input.number ||
        existing.operator !== input.operator ||
        existing.amount_cents !== amountCents
      ) throw new Error('idempotency key was already used with different request data');
      return this.toRecharge(existing);
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const transaction = this.db.transaction(() => {
      const wallet = this.db.prepare('SELECT balance_cents FROM wallets WHERE id = ?').get('default') as {
        balance_cents: number;
      };
      if (wallet.balance_cents < amountCents) throw new Error('insufficient wallet balance');
      this.db.prepare(
        `INSERT INTO recharges (id, number, operator, amount_cents, idempotency_key, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'INITIATED', ?, ?)`,
      ).run(id, input.number, input.operator, amountCents, input.idempotencyKey, now, now);
      this.db.prepare('UPDATE wallets SET balance_cents = balance_cents - ? WHERE id = ?').run(amountCents, 'default');
      this.db.prepare(
        `INSERT INTO ledger (id, wallet_id, recharge_id, entry_type, amount_cents, created_at)
         VALUES (?, 'default', ?, 'DEBIT', ?, ?)`,
      ).run(randomUUID(), id, amountCents, now);
      this.db.prepare("UPDATE recharges SET status = 'PENDING', updated_at = ? WHERE id = ?").run(now, id);
    });
    transaction();

    this.submitToOperator(id, input).catch(() => undefined);
    return this.getRecharge(id);
  }

  private async submitToOperator(id: string, input: RechargeInput) {
    try {
      const response = await this.operator.submit({ ...input, rechargeId: id });
      this.db.prepare('UPDATE recharges SET operator_request_id = ?, updated_at = ? WHERE id = ?')
        .run(response.requestId, new Date().toISOString(), id);
    } catch (error) {
      // Keep PENDING: the operator may have accepted the request before the timeout.
      const requestId = (error as Error & { requestId?: string }).requestId;
      if (requestId) {
        this.db.prepare('UPDATE recharges SET operator_request_id = ?, updated_at = ? WHERE id = ?')
          .run(requestId, new Date().toISOString(), id);
      }
    }
  }

  processWebhook(event: { eventId: string; rechargeId: string; result: Exclude<OperatorResult, 'UNKNOWN'>; payload?: unknown }) {
    const transaction = this.db.transaction(() => {
      const recharge = this.db.prepare('SELECT * FROM recharges WHERE id = ?').get(event.rechargeId) as Record<string, unknown> | undefined;
      if (!recharge) throw new Error('recharge not found');
      const inserted = this.db.prepare(
        `INSERT OR IGNORE INTO webhook_events (event_id, recharge_id, result, payload, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(event.eventId, event.rechargeId, event.result, JSON.stringify(event.payload ?? event), new Date().toISOString());
      if (inserted.changes === 0) return;
      if (!['INITIATED', 'PENDING'].includes(String(recharge.status))) {
        this.db.prepare(
          `INSERT INTO callback_anomalies (id, recharge_id, existing_status, incoming_result, payload, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        ).run(
          randomUUID(),
          event.rechargeId,
          String(recharge.status),
          event.result,
          JSON.stringify(event.payload ?? event),
          new Date().toISOString(),
        );
        return;
      }

      const now = new Date().toISOString();
      if (event.result === 'SUCCESS') {
        this.db.prepare("UPDATE recharges SET status = 'SUCCESS', updated_at = ? WHERE id = ? AND status IN ('INITIATED', 'PENDING')")
          .run(now, event.rechargeId);
        return;
      }
      this.db.prepare("UPDATE recharges SET status = 'FAILED', updated_at = ? WHERE id = ? AND status IN ('INITIATED', 'PENDING')")
        .run(now, event.rechargeId);
      this.refundInTransaction(event.rechargeId, now);
    });
    transaction();
    return this.getRecharge(event.rechargeId);
  }

  private refundInTransaction(rechargeId: string, now: string) {
    const recharge = this.db.prepare('SELECT amount_cents, refund_applied FROM recharges WHERE id = ?').get(rechargeId) as {
      amount_cents: number;
      refund_applied: number;
    };
    if (recharge.refund_applied) return;
    this.db.prepare('UPDATE wallets SET balance_cents = balance_cents + ? WHERE id = ?').run(recharge.amount_cents, 'default');
    this.db.prepare(
      `INSERT INTO ledger (id, wallet_id, recharge_id, entry_type, amount_cents, created_at)
       VALUES (?, 'default', ?, 'CREDIT', ?, ?)`,
    ).run(randomUUID(), rechargeId, recharge.amount_cents, now);
    this.db.prepare("UPDATE recharges SET refund_applied = 1, status = 'REFUNDED', updated_at = ? WHERE id = ?").run(now, rechargeId);
  }

  async reconcile() {
    const cutoff = new Date(Date.now() - this.pendingTimeoutMs).toISOString();
    const pending = this.db.prepare(
      "SELECT * FROM recharges WHERE status = 'PENDING' AND updated_at <= ? AND operator_request_id IS NOT NULL",
    ).all(cutoff) as Record<string, unknown>[];
    for (const recharge of pending) {
      const result = await this.operator.checkStatus(String(recharge.operator_request_id));
      if (result !== 'UNKNOWN') this.processWebhook({
        eventId: `reconciliation:${recharge.id}:${result}`,
        rechargeId: String(recharge.id),
        result,
      });
    }
    return pending.length;
  }

  getRecharge(id: string) {
    const recharge = this.db.prepare('SELECT * FROM recharges WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!recharge) throw new Error('recharge not found');
    return this.toRecharge(recharge);
  }

  listRecharges() {
    return (this.db.prepare('SELECT * FROM recharges ORDER BY created_at DESC').all() as Record<string, unknown>[]).map(row => this.toRecharge(row));
  }

  listCallbackAnomalies() {
    return this.db.prepare('SELECT * FROM callback_anomalies ORDER BY created_at DESC').all();
  }

  getWallet() {
    const wallet = this.db.prepare('SELECT balance_cents FROM wallets WHERE id = ?').get('default') as { balance_cents: number };
    const ledger = this.db.prepare('SELECT entry_type, amount_cents FROM ledger ORDER BY created_at ASC').all() as { entry_type: string; amount_cents: number }[];
    const reconciledCents = 100000 + ledger.reduce((sum, entry) => sum + (entry.entry_type === 'CREDIT' ? entry.amount_cents : -entry.amount_cents), 0);
    return { balance: wallet.balance_cents / 100, reconciledBalance: reconciledCents / 100 };
  }

  private toRecharge(row: Record<string, unknown>): Recharge {
    return {
      id: String(row.id),
      number: String(row.number),
      operator: String(row.operator),
      amount: Number(row.amount_cents) / 100,
      status: row.status as OrderStatus,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }
}
