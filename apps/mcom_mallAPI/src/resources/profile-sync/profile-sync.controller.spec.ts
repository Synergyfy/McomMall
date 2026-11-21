import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ProfileSyncController } from './profile-sync.controller';

const SECRET = 'wh_test_secret';

function sign(body: string): string {
  return crypto.createHmac('sha256', SECRET).update(body).digest('hex');
}

describe('ProfileSyncController', () => {
  const payload = {
    event: 'profile.updated',
    data: { userId: 'usr_1', eventId: 'evt_1' },
  };
  const rawBody = JSON.stringify(payload);
  const outcome = {
    event: 'profile.updated',
    userId: 'usr_1',
    duplicate: false,
  };

  let service: {
    getWebhookSecret: jest.Mock;
    handleIncomingEvent: jest.Mock;
  };
  let controller: ProfileSyncController;

  beforeEach(() => {
    service = {
      getWebhookSecret: jest.fn().mockReturnValue(SECRET),
      handleIncomingEvent: jest.fn().mockResolvedValue(outcome),
    };
    controller = new ProfileSyncController(service as any);
  });

  it('accepts a valid signature and delegates the event', async () => {
    await expect(
      controller.handleProfileUpdated(sign(rawBody), payload, { rawBody }),
    ).resolves.toEqual(outcome);
    expect(service.handleIncomingEvent).toHaveBeenCalledWith(payload);
  });

  it('accepts the sha256= prefixed header form', async () => {
    await expect(
      controller.handleProfileUpdated(`sha256=${sign(rawBody)}`, payload, {
        rawBody,
      }),
    ).resolves.toEqual(outcome);
  });

  it('rejects a request without a signature', async () => {
    await expect(
      controller.handleProfileUpdated(undefined, payload, { rawBody }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.handleIncomingEvent).not.toHaveBeenCalled();
  });

  it('rejects a tampered body', async () => {
    await expect(
      controller.handleProfileUpdated(sign(rawBody), payload, {
        rawBody: `${rawBody} `,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses to run when no secret is configured', async () => {
    service.getWebhookSecret.mockReturnValue('');
    await expect(
      controller.handleProfileUpdated(sign(rawBody), payload, { rawBody }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
