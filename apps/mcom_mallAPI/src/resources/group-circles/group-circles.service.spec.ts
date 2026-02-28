import { Test, TestingModule } from '@nestjs/testing';
import { GroupCirclesService } from './group-circles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupTransaction } from './entities/group-transaction.entity';
import { GroupCircleMessage } from './entities/group-circle-message.entity';
import { DataSource, Repository } from 'typeorm';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CapabilityService } from '../capability/capability.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { GroupType } from './group-type.enum';
import { CreateGroupDto } from './dto/create-group.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('GroupCirclesService', () => {
  let service: GroupCirclesService;
  let groupRepo: Repository<Group>;
  let usersService: UsersService;

  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  } as User;

  const mockGroup = {
    id: 'group-1',
    name: 'Test Group',
    type: GroupType.MARKETING,
    founderId: 'user-1',
    members: [],
  } as unknown as Group;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupCirclesService,
        {
          provide: getRepositoryToken(Group),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(GroupMember),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(GroupTransaction),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(GroupCircleMessage),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation((cb) =>
              cb({
                create: jest.fn().mockReturnValue({}),
                save: jest.fn().mockReturnValue({ id: 'new-id' }),
                findOne: jest.fn().mockReturnValue(mockUser),
              }),
            ),
          },
        },
        {
          provide: PaymentProviderService,
          useValue: {},
        },
        {
          provide: CentralIntegrationService,
          useValue: {},
        },
        {
          provide: CapabilityService,
          useValue: {
            checkPermission: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getReferredBusinesses: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<GroupCirclesService>(GroupCirclesService);
    groupRepo = module.get<Repository<Group>>(getRepositoryToken(Group));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a group circle and add the founder as owner', async () => {
      const dto: CreateGroupDto = {
        name: 'New Circle',
        type: GroupType.MARKETING,
        duration: 'Summer',
        contributionAmount: 0,
        networkIds: [],
        referredBusinessIds: [],
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ ...mockGroup, name: dto.name });

      const result = await service.create(dto, mockUser);
      expect(result).toBeDefined();
      expect(result.name).toBe(dto.name);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if group does not exist', async () => {
      jest.spyOn(groupRepo, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('invalid', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      jest.spyOn(groupRepo, 'findOne').mockResolvedValue({
        ...mockGroup,
        members: [{ userId: 'other-user' }],
      } as any);
      await expect(service.findOne('group-1', mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getReferredBusinesses', () => {
    it('should call usersService.getReferredBusinesses', async () => {
      await service.getReferredBusinesses(mockUser);
      expect(usersService.getReferredBusinesses).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });
});
