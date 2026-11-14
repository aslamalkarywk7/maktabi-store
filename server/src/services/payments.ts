/**
 * Payment gateway abstraction.
 *
 * - `mockGateway`: simulated card charge — keeps the whole order flow
 *   working out-of-the-box with zero configuration.
 * - `paypalGateway`: real PayPal Orders API (Sandbox by default) used when
 *   PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are set; otherwise PayPal
 *   checkouts fall back to an instant simulated approval.
 */

export interface ChargeResult {
  ok: boolean;
  provider: string;
  txn_id: string | null;
  reason?: string;
}

export interface PaymentGateway {
  readonly name: string;
  charge(amountMinor: number, orderRef: string): Promise<ChargeResult>;
}

export const mockGateway: PaymentGateway = {
  name: 'mock',
  async charge(amountMinor: number, orderRef: string): Promise<ChargeResult> {
    if (amountMinor <= 0) {
      return {ok: false, provider: 'mock', txn_id: null, reason: 'INVALID_AMOUNT'};
    }
    return {ok: true, provider: 'mock', txn_id: `TXN-MOCK-${orderRef}`};
  },
};
