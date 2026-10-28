export type OrderStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED';

export type OperatorResult = 'SUCCESS' | 'FAILED' | 'UNKNOWN';

export type RechargeInput = {
  number: string;
  operator: string;
  amount: number;
  idempotencyKey: string;
};

export type Recharge = {
  id: string;
  number: string;
  operator: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};
