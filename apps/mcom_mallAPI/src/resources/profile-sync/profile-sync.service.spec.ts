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

  it('disables the local account for profile.deleted without pulling Central', async () => {
    const disable = jest
      .spyOn(service, 'disableAccountForDeletedProfile')
      .mockResolvedValue({
        localUserId: 'local-1',
        businesses: 1,
        partnerships: 2,
      });

    const result = await service.handleIncomingEvent({
      event: 'profile.deleted',
      data: { userId: 'usr_1', eventId: 'evt_del' },
    });

    expect(serviceMesh.callPeer).not.toHaveBeenCalled();
    expect(disable).toHaveBeenCalledWith('usr_1', expect.any(Date));
    expect(eventsRepo.update).toHaveBeenCalledWith(
      'row-1',
      expect.objectContaining({ status: 'completed' }),
    );
    expect(result).toMatchObject({
      event: 'profile.deleted',
      duplicate: false,
      deleted: {
        localUserId: 'local-1',
        businesses: 1,
        partnerships: 2,
      },
    });
  });

  it('archives listings and disconnects partnerships without deleting data', async () => {
    const userUpdate = jest.fn().mockResolvedValue({});
    const businessRepo = {
      find: jest.fn().mockResolvedValue([
        { id: 'biz-1', status: 'published', centralDeletedStatus: null },
      ]),
      update: jest.fn().mockResolvedValue({}),
    };
    const productRepo = {
      find: jest.fn().mockResolvedValue([{ id: 'product-1' }]),
    };
    const serviceRepo = {
      find: jest.fn().mockResolvedValue([{ id: 'service-1' }]),
    };
    const partnershipRepo = {
      find: jest
        .fn()
        .mockResolvedValue([{ id: 'item-partnership-1', isActive: true }]),
      update: jest.fn().mockResolvedValue({}),
    };
    const userPartnershipRepo = {
      find: jest
        .fn()
        .mockResolvedValue([{ id: 'user-partnership-1', isActive: true }]),
      update: jest.fn().mockResolvedValue({}),
    };
    const itemRequestRepo = {
      find: jest.fn().mockResolvedValue([{ id: 'item-request-1' }]),
      update: jest.fn().mockResolvedValue({}),
    };
    const userRequestRepo = {
      find: jest.fn().mockResolvedValue([{ id: 'user-request-1' }]),
      update: jest.fn().mockResolvedValue({}),
    };
    const repositories: Record<string, any> = {
      User: { update: userUpdate },
      Business: businessRepo,
      Product: productRepo,
      Service: serviceRepo,
      Partnership: partnershipRepo,
      UserPartnership: userPartnershipRepo,
      ItemPartnershipRequest: itemRequestRepo,
      UserPartnershipRequest: userRequestRepo,
    };

    (service as any).userRepository = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'local-1', centralUserId: 'usr_1' }),
    };
    (service as any).dataSource = {
      transaction: jest.fn(async (callback: any) =>
        callback({
          getRepository: (entity: any) => repositories[entity.name],
        }),
      ),
    };

    const deletedAt = new Date('2026-11-24T12:00:00.000Z');
    const result = await service.disableAccountForDeletedProfile(
      'usr_1',
      deletedAt,
    );

    expect(result).toEqual({
      localUserId: 'local-1',
      businesses: 1,
      partnerships: 2,
    });
    expect(userUpdate).toHaveBeenCalledWith(
      'local-1',
      expect.objectContaining({
        isActive: false,
        centralDeletedAt: deletedAt,
        centralRefreshToken: null,
      }),
    );
    expect(businessRepo.update).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({
        status: 'archived',
        centralDeletedAt: deletedAt,
        centralDeletedStatus: 'published',
      }),
    );
    expect(partnershipRepo.update).toHaveBeenCalledWith(
      ['item-partnership-1'],
      expect.objectContaining({
        isActive: false,
        centralSuspendedAt: deletedAt,
        centralSuspendedForUserId: 'local-1',
      }),
    );
    expect(userPartnershipRepo.update).toHaveBeenCalledWith(
      ['user-partnership-1'],
      expect.objectContaining({
        isActive: false,
        centralSuspendedAt: deletedAt,
        centralSuspendedForUserId: 'local-1',
      }),
    );
    expect(itemRequestRepo.update).toHaveBeenCalledWith(
      ['item-request-1'],
      expect.objectContaining({
        status: 'declined',
        centralDeclinedAt: deletedAt,
        centralDeclinedForUserId: 'local-1',
      }),
    );
    expect(userRequestRepo.update).toHaveBeenCalledWith(
      ['user-request-1'],
      expect.objectContaining({
        status: 'declined',
        centralDeclinedAt: deletedAt,
        centralDeclinedForUserId: 'local-1',
      }),
    );
  });

  it('does not let an older profile.updated restore a deleted account', async () => {
    (service as any).userRepository = {
      findOne: jest.fn().mockResolvedValue({
        centralDeletedAt: new Date('2026-11-24T12:00:00.000Z'),
      }),
    };

    const result = await service.handleIncomingEvent({
      event: 'profile.updated',
      data: {
        userId: 'usr_1',
        eventId: 'evt_old',
        occurredAt: '2026-11-24T11:00:00.000Z',
      },
    });

    expect(result).toMatchObject({
      ignored: true,
      reason: 'stale_profile_update',
    });
    expect(serviceMesh.callPeer).not.toHaveBeenCalled();
    expect(eventsRepo.update).toHaveBeenCalledWith(
      'row-1',
      expect.objectContaining({ status: 'skipped' }),
    );
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
