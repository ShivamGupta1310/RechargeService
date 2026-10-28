# Recharge Service

An end-to-end React Native recharge demo backed by an Express + SQLite service.

## Run it

```sh
npm install
npm run server
```

In another terminal:

```sh
npm start
npm run ios       # or: npm run android
```

The app expects the API at `http://localhost:3000`. For a physical device, update `src/constants/api.ts` to the machine's LAN address.

## API

- `POST /recharges` accepts `{ number, operator, amount }` and an `Idempotency-Key` header.
- `GET /wallet` returns the current and ledger-derived reconciliation balances.
- `GET /recharges` and `GET /recharges/:id` return order state/history.
- `GET /callback-anomalies` returns callbacks that conflict with an already-terminal order for manual review.
- `POST /operator/webhook` accepts `{ eventId, rechargeId, result: "SUCCESS" | "FAILED" }`.
- `POST /reconciliation/run` checks old pending orders with the operator status API.

The local operator intentionally delays callbacks, duplicates some callbacks, and sometimes throws a timeout after accepting a request.

## Design decisions

- SQLite transactions make wallet debit + debit ledger entry atomic. A unique idempotency key prevents a double submit from creating a second order or debit.
- Webhook event IDs are stored with `INSERT OR IGNORE`, so retries are harmless. Terminal orders ignore late callbacks, preventing a late success from undoing a refund.
- If an operator request times out, the order remains `PENDING` and is not refunded. Reconciliation uses the operator status-check API; only a confirmed `FAILED` result triggers the refund.
- A callback received after an order is terminal (`SUCCESS`, `FAILED`, or `REFUNDED`) is stored in `callback_anomalies` and exposed through `GET /callback-anomalies`. It does not change the order status or ledger, so conflicting callbacks require manual review.
- Refunds are protected by both `refund_applied` and a unique `(recharge_id, entry_type)` ledger constraint. The credit and `REFUNDED` state update happen in one transaction.
- The ledger is append-only for wallet movements. `GET /wallet` recomputes the expected balance from the initial balance plus ledger entries.
- The mobile UI polls every two seconds to show delayed operator results and recharge history. A production app would use push updates or a durable client cache.

## Tests

```sh
npm run server:test
npm test
npx tsc --noEmit
```

The service tests cover idempotent double submit, exactly-once refund on duplicate webhook, and a late success after a failure/refund. The default React Native render test remains in place.

## With more time

I would add authentication and per-user wallets, an outbox/queue for operator calls, durable retry/backoff and dead-letter handling, signed webhook verification, a real operator adapter contract, migrations, structured logs/metrics, rate limiting, and a background scheduler for reconciliation instead of the manual endpoint.
