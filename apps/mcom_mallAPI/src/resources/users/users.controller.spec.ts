import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HashService } from '../../common/hash/hash.service';
import { Trial } from '../payments/entities/trial.entity';
import { Social } from './entities/social.entity';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUser),
            findCurrentUser: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Trial),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Social),
          useValue: {},
        },
        {
          provide: HashService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const req = { user: { id: '1' } };
      await expect(controller.findOne(req as any, '1')).resolves.toEqual(
        mockUser,
      );
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const req = { user: { id: '1' } };
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
        profilePictureUrl: 'http://example.com/profile.jpg',
      };
      await expect(
        controller.update(req as any, '1', updateUserDto),
      ).resolves.toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('findMe', () => {
    it('should return the current user', async () => {
      const req = { user: { id: '1' } };
      await expect(controller.findMe(req as any)).resolves.toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });
});
