import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HashService } from '../../common/hash/hash.service';
import { Social } from './entities/social.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Repository, DataSource } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { PromotionActivity } from '../promotion/entities/promotion-activity.entity';
import { Offer } from '../offer/entities/offer.entity';
import { ServiceProviderProfile } from '../service-provider-profile/entities/service-provider-profile.entity';
import { ProvisionService } from '../provision/provision.service';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';
import { TierService } from '../tier/tier.service';
import { MembershipService } from '../membership/membership.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let socialRepository: Repository<Social>;
  let emailService: EmailService;
  let transactionManager: { save: jest.Mock; create: jest.Mock };

  const mockUser = {
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    socials: null,
  } as User;

  const mockSocial = {
    id: '1',
    twitter: 'https://twitter.com/test',
  } as Social;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            merge: jest.fn(),
            save: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn(),
            exists: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Social),
          useValue: {
            create: jest.fn().mockResolvedValue(mockSocial),
            merge: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PromotionParticipant),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PromotionActivity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Offer),
          useValue: {},
        },
        {
          provide: HashService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue('hashedpassword'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendUserWelcomeEmail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ServiceProviderProfile),
          useValue: {},
        },
        {
          provide: ProvisionService,
          useValue: {
            findByCode: jest.fn(),
            validateAndMarkRedeemed: jest.fn(),
          },
        },
        {
          provide: ActivityTimerService,
          useValue: {
            getUserActiveTasks: jest.fn(),
          },
        },
        {
          provide: TierService,
          useValue: {
            findTrialTier: jest
              .fn()
              .mockResolvedValue({ id: 'tier-1', name: 'Trial' }),
          },
        },
        {
          provide: MembershipService,
          useValue: {
            joinTrial: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                save: jest.fn(),
                create: jest.fn(),
              },
            })),
            transaction: jest.fn().mockImplementation(async (callback) => {
              const savedUser = { ...mockUser };
              transactionManager = {
                save: jest.fn().mockResolvedValue(savedUser),
                create: jest.fn().mockReturnValue(savedUser),
              };
              return await callback(transactionManager);
            }),
            manager: {
              save: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    emailService = module.get<EmailService>(EmailService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    socialRepository = module.get<Repository<Social>>(
      getRepositoryToken(Social),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should update a user and their social links', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        socials: {
          twitter: 'https://twitter.com/updated',
        },
      };

      const existingUser = { ...mockUser, socials: { ...mockSocial } };
      (userRepository.findOne as jest.Mock).mockResolvedValue(existingUser);
      (userRepository.save as jest.Mock).mockResolvedValue(existingUser);

      const result = await service.update('1', updateUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['socials'],
      });
      expect(userRepository.merge).toHaveBeenCalledWith(existingUser, {
        firstName: 'Updated',
        lastName: 'User',
      });
      expect(socialRepository.merge).toHaveBeenCalledWith(
        existingUser.socials,
        updateUserDto.socials,
      );
      expect(userRepository.save).toHaveBeenCalledWith(existingUser);
      expect(result).toEqual(existingUser);
    });

    it('should create social links if they dont exist', async () => {
      const updateUserDto: UpdateUserDto = {
        socials: {
          twitter: 'https://twitter.com/new',
        },
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);

      await service.update('1', updateUserDto);

      expect(socialRepository.create).toHaveBeenCalledWith({
        ...updateUserDto.socials,
        user: mockUser,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a user with social links', async () => {
      const userWithSocials = { ...mockUser, socials: mockSocial };
      (userRepository.findOne as jest.Mock).mockResolvedValue(userWithSocials);

      const result = await service.findOne('1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['socials'],
      });
      expect(result).toEqual(userWithSocials);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a user and send a welcome email', async () => {
      const createUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password',
        phoneNumber: '1234567890',
        confirm_password: 'password',
      };

      const result = await service.create(createUserDto as any);

      expect(transactionManager.create).toHaveBeenCalledWith(User, {
        ...createUserDto,
        password: 'hashedpassword',
      });
      expect(transactionManager.save).toHaveBeenCalledWith(mockUser);
      expect(emailService.sendUserWelcomeEmail).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
