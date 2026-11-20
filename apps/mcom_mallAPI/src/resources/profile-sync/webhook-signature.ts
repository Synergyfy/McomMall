import * as crypto from 'crypto';

/**
 * Verify `X-Mcom-Webhook-Signature` against the raw request body.
 *
 * Central signs the exact bytes it sends. The header is accepted in both
 * forms used across the ecosystem: bare lowercase/uppercase hex, and the
 * `sha256=<hex>` prefixed form.
 */
export function verifyMcomWebhookSignature(
  rawBody: string,
  header: string | undefined,
  secret: string,
): boolean {
  if (!header || !secret) return false;

  const provided = header.trim().replace(/^sha256=/i, '');
  if (!/^[a-f0-9]{64}$/i.test(provided)) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const providedBuffer = Buffer.from(provided, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
}
