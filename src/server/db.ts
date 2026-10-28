import Database from 'better-sqlite3';

export const createDatabase = (filename = ':memory:') => {
  const db = new Database(filename);
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      balance_cents INTEGER NOT NULL CHECK (balance_cents >= 0)
    );
    CREATE TABLE IF NOT EXISTS recharges (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      operator TEXT NOT NULL,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      idempotency_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      operator_request_id TEXT,
      refund_applied INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ledger (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL REFERENCES wallets(id),
      recharge_id TEXT NOT NULL REFERENCES recharges(id),
      entry_type TEXT NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      created_at TEXT NOT NULL,
      UNIQUE (recharge_id, entry_type)
    );
    CREATE TABLE IF NOT EXISTS webhook_events (
      event_id TEXT PRIMARY KEY,
      recharge_id TEXT NOT NULL REFERENCES recharges(id),
      result TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS callback_anomalies (
      id TEXT PRIMARY KEY,
      recharge_id TEXT NOT NULL REFERENCES recharges(id),
      existing_status TEXT NOT NULL,
      incoming_result TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO wallets (id, balance_cents) VALUES ('default', 100000);
  `);
  return db;
};

export type DatabaseConnection = ReturnType<typeof createDatabase>;
