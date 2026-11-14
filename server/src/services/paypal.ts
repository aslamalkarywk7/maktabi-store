/**
 * PayPal Orders API client (Sandbox by default).
 *
 * Activate by setting PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in `.env`
 * (create a free sandbox app at https://developer.paypal.com/dashboard).
 * Without credentials the platform runs in simulated mode so the full
 * checkout flow still works locally.
 */

const API_BASE = process.env.PAYPAL_API_BASE ?? 'https://api-m.sandbox.paypal.com';

export const paypalConfigured = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

let cachedToken: {token: string; expiresAt: number} | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString('base64');
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const data = (await res.json()) as {access_token: string; expires_in: number};
  cachedToken = {token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000};
  return data.access_token;
}

export interface PaypalOrder {
  id: string;
  status: string;
  links: {href: string; rel: string}[];
}

/** Create a PayPal order and return it (the `approve` link is the redirect target). */
export async function createOrder(amountMajor: string, reference: string, returnUrl: string, cancelUrl: string): Promise<PaypalOrder> {
  const token = await accessToken();
  const res = await fetch(`${API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {reference_id: reference, amount: {currency_code: 'USD', value: amountMajor}},
      ],
      application_context: {return_url: returnUrl, cancel_url: cancelUrl},
    }),
  });
  if (!res.ok) throw new Error(`PayPal create-order failed (${res.status})`);
  return (await res.json()) as PaypalOrder;
}

/** Capture an approved PayPal order. */
export async function captureOrder(paypalOrderId: string): Promise<{ok: boolean; txnId: string | null; reason?: string}> {
  const token = await accessToken();
  const res = await fetch(`${API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
  });
  const data = (await res.json()) as {status: string; purchase_units?: {payments?: {captures?: {id: string; status: string}[]}}[]};
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  if (!res.ok || data.status !== 'COMPLETED' || !capture || capture.status !== 'COMPLETED') {
    return {ok: false, txnId: null, reason: data.status ?? 'CAPTURE_FAILED'};
  }
  return {ok: true, txnId: capture.id};
}
