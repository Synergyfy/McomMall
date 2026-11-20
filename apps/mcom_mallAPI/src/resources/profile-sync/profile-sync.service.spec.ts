import { ServiceUnavailableException } from '@nestjs/common';
import { ProfileSyncService } from './profile-sync.service';
import {
  buildNewUserIdentity,
  syncCentralIdentity,
} from '../sso/central-profile-sync';

jest.mock('../sso/central-profile-sync', () => ({
  buildNewUserIdentity: jest.fn(),
  syncCentralIdentity: jest.fn(),
}));

const buildIdentity = buildNewUserIdentity as jest.Mock;
const syncIdentity = syncCentralIdentity as jest.Mock;

const PAYLOAD = {
  event: 'profile.updated',
  data: { userId: 'usr_1', eventId: 'evt_1' },
};

describe('ProfileSyncService', () => {
  let service: ProfileSyncService;
  let eventsRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let usersService: { findOrCreateFromCentralIdentity: jest.Mock };
  let serviceMesh: { getSolutionsUrl: jest.Mock; callPeer: jest.Mock };
  let configValues: Record<string, string | undefined>;

  beforeEach(() => {
    configValues = { MCOM_CLIENT_SECRET: 'cs_test' };

    eventsRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn((value) =>
        Promise.resolve({
          ...value,
          id: 'row-1',
          updated_at: new Date(),
        }),
      ),
      update: jest.fn().mockResolvedValue({}),
    };

    usersService = {
      findOrCreateFromCentralIdentity: jest.fn().mockResolvedValue({
        id: 'local-1',
        role: 'CUSTOMER',
      }),
    };

    serviceMesh = {
      getSolutionsUrl: jest.fn().mockReturnValue('http://central.test'),
      callPeer: jest.fn().mockResolvedValue({
        user: { id: 'usr_1', email: 'a@b.co', role: 'CUSTOMER' },
      }),
    };

    buildIdentity.mockReturnValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      phoneNumber: '07000000000',
      role: 'CUSTOMER',
    });
    syncIdentity.mockResolvedValue({
      user: { id: 'local-1', role: 'CUSTOMER' },
      business: null,
    });

    service = new ProfileSyncService(
      eventsRepo as any,
      {} as any,
      {} as any,
      usersService as any,
      serviceMesh as any,
      { getUserContext: jest.fn() } as any,
      {
        get: jest.fn((key: string) => configValues[key]),
      } as any,
    );
  });

  it('pulls the canonical profile over the mesh and mirrors it locally', async () => {
    const result = await service.handleIncomingEvent(PAYLOAD);

    expect(serviceMesh.callPeer).toHaveBeenCalledWith(
      'http://central.test',
      'mcom-central',
      '/api/v1/ecosystem/profiles/usr_1',
      expect.objectContaining({ method: 'GET' }),
      'central:read',
    );
    expect(syncIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        centralUser: expect.objectContaining({ email: 'a@b.co' }),
      }),
    );
    expect(eventsRepo.update).toHaveBeenCalledWith(
      'row-1',
      expect.objectContaining({ status: 'completed' }),
    );
    expect(result).toMatchObject({
      duplicate: false,
      synced: { localUserId: 'local-1', localBusinessId: null },
    });
  });

  it('acknowledges a duplicate delivery without re-pulling', async () => {
    eventsRepo.findOne.mockResolvedValue({
      id: 'row-1',
      status: 'completed',
      updated_at: new Date(),
    });

    const result = await service.handleIncomingEvent(PAYLOAD);

    expect(result.duplicate).toBe(true);
    expect(serviceMesh.callPeer).not.toHaveBeenCalled();
  });

  it('ignores events it does not own', async () => {
    const result = await service.handleIncomingEvent({
      event: 'package.created',
      data: { userId: 'usr_1' },
    });

    expect(result).toMatchObject({ ignored: true, reason: 'unsupported_event' });
    expect(eventsRepo.save).not.toHaveBeenCalled();
  });

  it('treats a role the app does not serve as a permanent skip', async () => {
    serviceMesh.callPeer.mockRejectedValue(
      Object.assign(new Error('Forbidden'), { response: { status: 403 } }),
    );

    const result = await service.handleIncomingEvent(PAYLOAD);

    expect(result).toMatchObject({ ignored: true, reason: 'not_served' });
    expect(eventsRepo.update).toHaveBeenCalledWith(
      'row-1',
      expect.objectContaining({ status: 'skipped' }),
    );
  });

  it('retries a previously failed delivery in place', async () => {
    eventsRepo.findOne.mockResolvedValue({
      id: 'row-1',
      status: 'failed',
      attempts: 1,
      updated_at: new Date(),
    });
    serviceMesh.callPeer.mockRejectedValue(
      Object.assign(new Error('upstream 500'), { response: { status: 500 } }),
    );

    await expect(service.handleIncomingEvent(PAYLOAD)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(eventsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ attempts: 2, status: 'processing' }),
    );
  });

  it('asks Central to retry when the pull fails transiently', async () => {
    serviceMesh.callPeer.mockRejectedValue(
      Object.assign(new Error('upstream 500'), { response: { status: 500 } }),
    );

    await expect(service.handleIncomingEvent(PAYLOAD)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(eventsRepo.update).toHaveBeenCalledWith(
      'row-1',
      expect.objectContaining({ status: 'failed' }),
    );
  });

  it('skips profiles that arrive without an email', async () => {
    serviceMesh.callPeer.mockResolvedValue({ user: { id: 'usr_1' } });

    const result = await service.handleIncomingEvent(PAYLOAD);

    expect(result).toMatchObject({ ignored: true, reason: 'missing_email' });
  });

  it('rejects payloads without a central user id', async () => {
    await expect(
      service.handleIncomingEvent({ event: 'profile.updated', data: {} }),
    ).rejects.toThrow('data.userId');
  });
});
