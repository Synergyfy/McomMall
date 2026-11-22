import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { MembershipSyncController } from './membership-sync.controller';

const SECRET = 'wh_membership_secret';

function sign(body: string): string {
  return crypto.createHmac('sha256', SECRET).update(body).digest('hex');
}

describe('MembershipSyncController', () => {
  const payload = {
    event: 'membership.updated',
    data: { userId: 'usr_1', eventId: 'evt_1' },
  };
  const rawBody = JSON.stringify(payload);
  const outcome = {
    event: 'membership.updated',
    userId: 'usr_1',
    duplicate: false,
  };

  let service: {
    getWebhookSecret: jest.Mock;
    handleIncomingEvent: jest.Mock;
  };
  let controller: MembershipSyncController;

  beforeEach(() => {
    service = {
      getWebhookSecret: jest.fn().mockReturnValue(SECRET),
      handleIncomingEvent: jest.fn().mockResolvedValue(outcome),
    };
    controller = new MembershipSyncController(service as any);
  });

  it('accepts a valid X-Mcom-Webhook-Signature and delegates the event', async () => {
    await expect(
      controller.handleMembershipUpdated(
        { 'x-mcom-webhook-signature': sign(rawBody) },
        payload,
        { rawBody },
      ),
    ).resolves.toEqual(outcome);
    expect(service.handleIncomingEvent).toHaveBeenCalledWith(payload);
  });

  it('accepts the X-Mcom-Signature alias and sha256= prefix', async () => {
    await expect(
      controller.handleMembershipUpdated(
        { 'x-mcom-signature': `sha256=${sign(rawBody)}` },
        payload,
        { rawBody },
      ),
    ).resolves.toEqual(outcome);
  });

  it('rejects a request without a signature', async () => {
    await expect(
      controller.handleMembershipUpdated({}, payload, { rawBody }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.handleIncomingEvent).not.toHaveBeenCalled();
  });

  it('rejects a tampered body', async () => {
    await expect(
      controller.handleMembershipUpdated(
        { 'x-mcom-webhook-signature': sign(rawBody) },
        payload,
        { rawBody: `${rawBody} ` },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses to run when no secret is configured', async () => {
    service.getWebhookSecret.mockReturnValue('');
    await expect(
      controller.handleMembershipUpdated(
        { 'x-mcom-webhook-signature': sign(rawBody) },
        payload,
        { rawBody },
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
