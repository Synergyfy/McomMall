import * as crypto from 'crypto';
import { verifyMcomWebhookSignature } from './webhook-signature';

const SECRET = 'wh_test_secret';
const BODY = JSON.stringify({
  event: 'profile.updated',
  data: { userId: 'usr_1', eventId: 'evt_1' },
});

function sign(body: string, secret = SECRET): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

describe('verifyMcomWebhookSignature', () => {
  it('accepts a bare hex signature', () => {
    expect(verifyMcomWebhookSignature(BODY, sign(BODY), SECRET)).toBe(true);
  });

  it('accepts a sha256= prefixed signature', () => {
    expect(
      verifyMcomWebhookSignature(BODY, `sha256=${sign(BODY)}`, SECRET),
    ).toBe(true);
  });

  it('rejects a signature made with another secret', () => {
    expect(verifyMcomWebhookSignature(BODY, sign(BODY, 'other'), SECRET)).toBe(
      false,
    );
  });

  it('rejects a tampered body', () => {
    expect(
      verifyMcomWebhookSignature(`${BODY} `, sign(BODY), SECRET),
    ).toBe(false);
  });

  it('rejects a missing or malformed header', () => {
    expect(verifyMcomWebhookSignature(BODY, undefined, SECRET)).toBe(false);
    expect(verifyMcomWebhookSignature(BODY, 'not-a-signature', SECRET)).toBe(
      false,
    );
  });

  it('rejects when no secret is configured', () => {
    expect(verifyMcomWebhookSignature(BODY, sign(BODY), '')).toBe(false);
  });
});
