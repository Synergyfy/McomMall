import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProviderProfileService } from './service-provider-profile.service';
import { ServiceProviderProfile } from './entities/service-provider-profile.entity';
import { User } from '../users/entities/user.entity';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UserRole } from '../../common/role.enum';
import { CreateServiceProviderProfileDto } from './dto/create-service-provider-profile.dto';
import { UpdateServiceProviderProfileDto } from './dto/update-service-provider-profile.dto';

const mockProfileRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

describe('ServiceProviderProfileService', () => {
  let service: ServiceProviderProfileService;
  let profileRepository: Repository<ServiceProviderProfile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceProviderProfileService,
        {
          provide: getRepositoryToken(ServiceProviderProfile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ServiceProviderProfileService>(
      ServiceProviderProfileService,
    );
    profileRepository = module.get<Repository<ServiceProviderProfile>>(
      getRepositoryToken(ServiceProviderProfile),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateServiceProviderProfileDto = {
      skills: ['plumbing'],
      serviceArea: 'NYC',
    };
    const user = {
      id: 'user-id',
      role: UserRole.OWNER,
      populateName: jest.fn(),
    } as unknown as User;

    it('should create a profile successfully', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue({ ...createDto, user });
      mockProfileRepository.save.mockResolvedValue({
        id: 'profile-id',
        ...createDto,
        user,
      });

      const result = await service.create(createDto, user);

      expect(result).toBeDefined();
      expect(result.skills).toEqual(createDto.skills);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
      });
      expect(mockProfileRepository.create).toHaveBeenCalledWith({
        ...createDto,
        user,
      });
      expect(mockProfileRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not a service provider', async () => {
      const nonProviderUser = { ...user, role: UserRole.CUSTOMER, populateName: jest.fn() } as unknown as User;
      await expect(service.create(createDto, nonProviderUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException if profile already exists', async () => {
      mockProfileRepository.findOne.mockResolvedValue({});
      await expect(service.create(createDto, user)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findMyProfile', () => {
    const user = { id: 'user-id' } as User;
    it('should return the user profile', async () => {
      const profile = { id: 'profile-id', user };
      mockProfileRepository.findOne.mockResolvedValue(profile);
      const result = await service.findMyProfile(user);
      expect(result).toEqual(profile);
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);
      await expect(service.findMyProfile(user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateServiceProviderProfileDto = { serviceArea: 'LA' };
    const user = { id: 'user-id' } as User;
    const existingProfile = { id: 'profile-id', user, serviceArea: 'NYC' };

    it('should update a profile successfully', async () => {
      jest.spyOn(service, 'findMyProfile').mockResolvedValue(existingProfile as any);
      mockProfileRepository.merge.mockReturnValue({
        ...existingProfile,
        ...updateDto,
      });
      mockProfileRepository.save.mockResolvedValue({
        ...existingProfile,
        ...updateDto,
      });

      const result = await service.update(updateDto, user);
      expect(result.serviceArea).toEqual('LA');
      expect(profileRepository.save).toHaveBeenCalled();
    });
  });
});