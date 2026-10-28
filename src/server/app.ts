import express from 'express';
import { createDatabase, DatabaseConnection } from './db';
import { OperatorClient, UnreliableOperator } from './operator';
import { RechargeService } from './service';

export const createApp = (options?: { db?: DatabaseConnection; operator?: OperatorClient; pendingTimeoutMs?: number }) => {
  const db = options?.db ?? createDatabase();
  let service!: RechargeService;
  const operator = options?.operator ?? new UnreliableOperator(event => {
    try { service.processWebhook(event); } catch { /* callback for a deleted/unknown order */ }
  });
  service = new RechargeService(db, operator, options?.pendingTimeoutMs);
  const app = express();
  app.use(express.json());

  app.get('/wallet', (_req, res) => res.json(service.getWallet()));
  app.get('/recharges', (_req, res) => res.json(service.listRecharges()));
  app.get('/recharges/:id', (req, res) => {
    try { return res.json(service.getRecharge(req.params.id)); } catch (error) { return res.status(404).json({ error: (error as Error).message }); }
  });
  app.get('/callback-anomalies', (_req, res) => res.json(service.listCallbackAnomalies()));
  app.post('/recharges', (req, res) => {
    try {
      const recharge = service.createRecharge({
        number: String(req.body.number ?? ''),
        operator: String(req.body.operator ?? ''),
        amount: Number(req.body.amount),
        idempotencyKey: String(req.header('Idempotency-Key') ?? req.body.idempotencyKey ?? ''),
      });
      return res.status(201).json(recharge);
    } catch (error) {
      const message = (error as Error).message;
      return res.status(message.includes('insufficient') ? 409 : 400).json({ error: message });
    }
  });
  app.post('/operator/webhook', (req, res) => {
    try {
      const recharge = service.processWebhook({
        eventId: String(req.body.eventId ?? ''),
        rechargeId: String(req.body.rechargeId ?? ''),
        result: req.body.result,
        payload: req.body,
      });
      return res.json(recharge);
    } catch (error) { return res.status(400).json({ error: (error as Error).message }); }
  });
  app.post('/reconciliation/run', async (_req, res) => res.json({ scanned: await service.reconcile() }));
  return { app, db, service };
};
