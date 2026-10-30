import { UserRole } from '../../common/role.enum';
import { UsersService } from './users.service';

function makeService() {
  const userRepository = {
    findOne: jest.fn(),
    restore: jest.fn().mockResolvedValue(undefined),
  };
  const service = new UsersService(
    userRepository as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );
  return { service, userRepository };
}

const identity = {
  email: 'New.User@Example.com',
  centralUserId: 'central-1',
  firstName: 'New',
  lastName: 'User',
  phoneNumber: '+440000000000',
  role: UserRole.CUSTOMER,
};

describe('UsersService.findOrCreateFromCentralIdentity', () => {
  it('returns an existing account (case-insensitive) without inserting', async () => {
    const { service, userRepository } = makeService();
    const existing = { id: 'u1', email: 'new.user@example.com' };
    userRepository.findOne.mockResolvedValue(existing);
    const create = jest.spyOn(service, 'create');

    const result = await service.findOrCreateFromCentralIdentity(identity);

    expect(result).toBe(existing);
    expect(create).not.toHaveBeenCalled();
    expect(userRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ withDeleted: true }),
    );
  });

  it('recovers from a concurrent insert (23505) by returning the winner', async () => {
    const { service, userRepository } = makeService();
    const winner = { id: 'u2', email: 'new.user@example.com' };
    userRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(winner);
    jest
      .spyOn(service, 'create')
      .mockRejectedValue(Object.assign(new Error('duplicate'), { code: '23505' }));

    const result = await service.findOrCreateFromCentralIdentity(identity);

    expect(result).toBe(winner);
  });

  it('restores a soft-deleted account instead of failing the unique index', async () => {
    const { service, userRepository } = makeService();
    const deleted = {
      id: 'u3',
      email: 'new.user@example.com',
      deleted_at: new Date(),
    };
    const restored = { ...deleted, deleted_at: null };
    userRepository.findOne
      .mockResolvedValueOnce(deleted)
      .mockResolvedValueOnce(restored);

    const result = await service.findOrCreateFromCentralIdentity(identity);

    expect(userRepository.restore).toHaveBeenCalledWith('u3');
    expect(result).toBe(restored);
  });
});
