import { randomUUID } from 'crypto';
import { OperatorResult } from './types';

export type OperatorCallback = (event: {
  eventId: string;
  rechargeId: string;
  result: Exclude<OperatorResult, 'UNKNOWN'>;
}) => void;

export interface OperatorClient {
  submit(input: {
    rechargeId: string;
    number: string;
    operator: string;
    amount: number;
  }): Promise<{ requestId: string }>;
  checkStatus(requestId: string): Promise<OperatorResult>;
}

/** Deliberately unreliable local operator used by the demo and reconciliation tests. */
export class UnreliableOperator implements OperatorClient {
  private readonly outcomes = new Map<string, OperatorResult>();

  constructor(
    private readonly callback: OperatorCallback,
    private readonly random = Math.random,
  ) {}

  async submit(input: { rechargeId: string; number: string; operator: string; amount: number }) {
    const requestId = randomUUID();
    const result: Exclude<OperatorResult, 'UNKNOWN'> =
      this.random() < 0.2 ? 'FAILED' : 'SUCCESS';
    this.outcomes.set(requestId, result);

    // The callback is intentionally late and can be duplicated.
    const delay = 10 * 1000;
    setTimeout(() => {
      this.callback({ eventId: randomUUID(), rechargeId: input.rechargeId, result });
      if (this.random() < 0.35) {
        setTimeout(
          () => this.callback({ eventId: randomUUID(), rechargeId: input.rechargeId, result }),
          50,
        );
      }
    }, delay);

    // A real timeout means the caller may not receive this response even though the operator
    // has accepted the request; reconciliation can still use checkStatus(requestId).
    if (this.random() < 0.2) {
      const error = new Error('operator request timed out') as Error & { requestId?: string };
      error.requestId = requestId;
      throw error;
    }
    return { requestId };
  }

  async checkStatus(requestId: string): Promise<OperatorResult> {
    if (!this.outcomes.has(requestId) || this.random() < 0.2) {
      return 'UNKNOWN';
    }
    return this.outcomes.get(requestId) ?? 'UNKNOWN';
  }
}
