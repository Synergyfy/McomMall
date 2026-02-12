import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Brackets, DataSource, IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchOwnerDto } from './dto/search-owner.dto';
import { ServiceProviderProfile } from '../service-provider-profile/entities/service-provider-profile.entity';
import { HashService } from '../../common/hash/hash.service';
import { Social } from './entities/social.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { PromotionActivity } from '../promotion/entities/promotion-activity.entity';
import { Offer } from '../offer/entities/offer.entity';
import { EmailService } from '../email/email.service';
import { TrialService } from '../trial/trial.service';
import { UserRole } from '../../common/role.enum';
import { Wallet } from '../wallet/entities/wallet.entity';
import { UpdateUserFeaturesDto } from './dto/update-user-features.dto';
import { ProvisionService } from '../provision/provision.service';
import { ProvisionType } from '../provision/entities/provision.entity';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ServiceProviderProfile)
    private serviceProviderProfileRepository: Repository<ServiceProviderProfile>,
    @InjectRepository(Social)
    private socialRepository: Repository<Social>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(PromotionParticipant)
    private promotionParticipantRepository: Repository<PromotionParticipant>,
    @InjectRepository(PromotionActivity)
    private promotionActivityRepository: Repository<PromotionActivity>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
    private readonly trialService: TrialService,
    private readonly dataSource: DataSource,
    private readonly provisionService: ProvisionService,
    private readonly activityTimerService: ActivityTimerService,
  ) { }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      const emailExists = await this.userRepository.exists({
        where: { email },
      });
      return emailExists;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }
  async checkPhoneNumberExists(phoneNumber: string): Promise<boolean> {
    try {
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      const emailExists = await this.userRepository.exists({
        where: { phoneNumber },
      });
      return emailExists;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }

  async create(payload: CreateUserDto): Promise<User> {
    // Validate provision code before transaction if present
    let provision = null;
    if (payload.provisionCode) {
      provision = await this.provisionService.findByCode(payload.provisionCode);
      if (!provision) throw new BadRequestException('Invalid provision code');
      if (provision.isRedeemed) throw new BadRequestException('Provision code already redeemed');
      if (new Date() > provision.expiresAt) throw new BadRequestException('Provision code expired');
    }

    const createdUser = await this.dataSource.transaction(async (manager) => {
      const { password, role } = payload;
      const hashed = await this.hashService.hashPassword(password);
      const user = manager.create(User, {
        ...payload,
        password: hashed,
      });
      const savedUser = await manager.save(user);

      // Redeem provision code inside transaction
      let trialDuration = 14;
      if (provision) {
        await this.provisionService.validateAndMarkRedeemed(provision.code, savedUser.id);
        if (provision.type === ProvisionType.TRIAL_EXTENSION && provision.payload?.durationDays) {
          trialDuration = provision.payload.durationDays;
        }
      }

      const wallet = manager.create(Wallet, {
        user: savedUser,
        balance: 1000, // Starting balance for every new user
      });
      await manager.save(wallet);

      if (role === UserRole.OWNER) {
        await this.trialService.createTrial(savedUser, manager, trialDuration);
      }

      await this.emailService.sendUserWelcomeEmail(savedUser);
      delete savedUser.password;
      return savedUser;
    });

    // Trigger Activity Timer assignment for Owners (post-transaction to ensure user exists)
    if (createdUser.role === UserRole.OWNER) {
      try {
        await this.activityTimerService.getUserActiveTimer(createdUser);
      } catch (error) {
        console.error('Failed to auto-assign activity timer:', error);
      }
    }

    return createdUser;
  }

  async createByAdmin(payload: CreateUserDto): Promise<User> {
    // Validate provision code before transaction if present
    let provision = null;
    if (payload.provisionCode) {
      provision = await this.provisionService.findByCode(payload.provisionCode);
      if (!provision) throw new BadRequestException('Invalid provision code');
      if (provision.isRedeemed) throw new BadRequestException('Provision code already redeemed');
      if (new Date() > provision.expiresAt) throw new BadRequestException('Provision code expired');
    }

    const createdUser = await this.dataSource.transaction(async (manager) => {
      const { password, role } = payload;
      const hashed = await this.hashService.hashPassword(password);
      const user = manager.create(User, {
        ...payload,
        password: hashed,
        isEmailVerified: true, // Auto-verified by admin
      });
      const savedUser = await manager.save(user);

      // Redeem provision code inside transaction
      let trialDuration = 14;
      if (provision) {
        await this.provisionService.validateAndMarkRedeemed(provision.code, savedUser.id);
        if (provision.type === ProvisionType.TRIAL_EXTENSION && provision.payload?.durationDays) {
          trialDuration = provision.payload.durationDays;
        }
      }

      const wallet = manager.create(Wallet, {
        user: savedUser,
        balance: 1000, // Starting balance for every new user
      });
      await manager.save(wallet);

      if (role === UserRole.OWNER) {
        await this.trialService.createTrial(savedUser, manager, trialDuration);
      }

      await this.emailService.sendUserWelcomeEmail(savedUser);
      delete savedUser.password;
      return savedUser;
    });

    // Trigger Activity Timer assignment for Owners (post-transaction to ensure user exists)
    if (createdUser.role === UserRole.OWNER) {
      // We catch errors here to strictly not block user creation if timer service fails,
      // though ideally it should succeed.
      try {
        await this.activityTimerService.getUserActiveTimer(createdUser);
      } catch (error) {
        console.error('Failed to auto-assign activity timer:', error);
      }
    }

    return createdUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  async findCurrentUser(email: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.trial', 'trial')
      .where('user.email = :email', { email })
      .getOne();

    return user;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['socials'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneBusinessUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['socials'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { socials: socialsDto, ...userDto } = updateUserDto;

    // Security: Prevent role updates
    delete (userDto as Partial<CreateUserDto>).role;

    // Update user properties
    this.userRepository.merge(user, userDto);

    // Update social links
    if (socialsDto) {
      if (user.socials) {
        this.socialRepository.merge(user.socials, socialsDto);
      } else {
        const newSocials = this.socialRepository.create({
          ...socialsDto,
          user,
        });
        user.socials = newSocials;
      }
    }

    return this.userRepository.save(user);
  }

  async searchOwnersWithServiceProfiles(
    query: SearchOwnerDto,
  ): Promise<User[]> {
    const { skills, serviceArea } = query;
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        'user.serviceProviderProfile',
        'serviceProviderProfile',
      )
      .where('user.role = :role', { role: UserRole.OWNER });

    if (serviceArea) {
      queryBuilder.andWhere(
        'LOWER(serviceProviderProfile.serviceArea) LIKE LOWER(:serviceArea)',
        { serviceArea: `%${serviceArea}%` },
      );
    }

    if (skills && skills.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          skills.forEach((skill, index) => {
            const skillParam = `skill_${index}`;
            if (index === 0) {
              qb.where(`LOWER(serviceProviderProfile.skills) LIKE LOWER(:${skillParam})`, {
                [skillParam]: `%${skill}%`,
              });
            } else {
              qb.orWhere(`LOWER(serviceProviderProfile.skills) LIKE LOWER(:${skillParam})`, {
                [skillParam]: `%${skill}%`,
              });
            }
          });
        }),
      );
    }

    return queryBuilder.getMany();
  }

  async searchOwners(query: string, currentUserId: string): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('u');

    queryBuilder.where('u.role = :role', { role: UserRole.OWNER });
    queryBuilder.andWhere('u.id != :currentUserId', { currentUserId });
    queryBuilder.andWhere('u.isActive = :isActive', { isActive: true });

    if (query && query.trim() !== '') {
      const searchTerm = `%${query.trim()}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('u.firstName ILIKE :searchTerm', { searchTerm })
            .orWhere('u.lastName ILIKE :searchTerm', { searchTerm })
            .orWhere('u.email ILIKE :searchTerm', { searchTerm });
        }),
      );
    }

    return queryBuilder.getMany();
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getRedeemedOffers(userId: string, query: any) {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const [transactions, total_items] =
      await this.transactionRepository.findAndCount({
        where: { user: { id: userId }, offer: { id: Not(IsNull()) } },
        relations: ['offer'],
        skip: offset,
        take: limit,
        order: { created_at: 'DESC' },
      });

    const total_pages = Math.ceil(total_items / limit);

    return {
      status: 'success',
      pagination: {
        current_page: page,
        total_pages,
        total_items,
        limit,
      },
      data: {
        redeemed_offers: transactions.map((t) => ({
          redemption_id: t.id,
          offer_id: t.offer.id,
          name: t.offer.name,
          description: t.offer.description,
          points_spent: t.offer.points,
          redemption_date: t.created_at,
          status: 'used', // Assuming all transactions are 'used' offers
        })),
      },
    };
  }

  async getPromotions(userId: string, query: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { status = 'active' } = query;
    const queryBuilder = this.promotionParticipantRepository
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.promotion', 'promotion')
      .where('participant.userId = :userId', { userId });

    if (status === 'active') {
      queryBuilder.andWhere(
        '(promotion.endDate IS NULL OR promotion.endDate > :now)',
        { now: new Date() },
      );
    } else if (status === 'expired') {
      queryBuilder.andWhere('promotion.endDate < :now', { now: new Date() });
    }

    const participants = await queryBuilder.getMany();

    return {
      status: 'success',
      data: {
        promotions: participants.map((p) => ({
          promotion_id: p.promotion.id,
          name: p.promotion.name,
          description: p.promotion.description,
          balance: p.pointsEarned,
          status:
            p.promotion.endDate && p.promotion.endDate < new Date()
              ? 'expired'
              : 'active',
          end_date: p.promotion.endDate,
        })),
      },
    };
  }

  async getTransactionHistory(userId: string, query: any) {
    const { page = 1, limit = 20, type, promotion_id } = query;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const allTransactions = [];

    // Fetch earning transactions
    if (type !== 'spend') {
      const earnQueryOptions: any = {
        where: { user: { id: userId } },
        relations: ['promotion'],
      };
      if (promotion_id) {
        earnQueryOptions.where.promotion = { id: promotion_id };
      }
      const activities =
        await this.promotionActivityRepository.find(earnQueryOptions);
      const earnTransactions = activities.map((a) => ({
        transaction_id: `earn_${a.id}`,
        type: 'earn',
        points: a.pointsEarned,
        description: `Points earned from ${a.promotion?.name || 'a promotion'}`,
        timestamp: a.created_at,
        details: {
          promotion_id: a.promotion?.id,
          promotion_name: a.promotion?.name,
        },
      }));
      allTransactions.push(...earnTransactions);
    }

    // Fetch spending transactions
    if (type !== 'earn' && !promotion_id) {
      // Cannot filter spending by promotion
      const spendTransactions = await this.transactionRepository.find({
        where: { user: { id: userId }, offer: { id: Not(IsNull()) } },
        relations: ['offer'],
      });
      const mappedSpend = spendTransactions.map((t) => ({
        transaction_id: `spend_${t.id}`,
        type: 'spend',
        points: -t.offer.points,
        description: `Redeemed '${t.offer.name}'`,
        timestamp: t.created_at,
        details: {
          offer_id: t.offer.id,
          offer_name: t.offer.name,
        },
      }));
      allTransactions.push(...mappedSpend);
    }

    // Sort all transactions by date
    allTransactions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    // Apply pagination
    const total_items = allTransactions.length;
    const total_pages = Math.ceil(total_items / limit);
    const offset = (page - 1) * limit;
    const paginatedTransactions = allTransactions.slice(offset, offset + limit);

    return {
      status: 'success',
      pagination: {
        current_page: page,
        total_pages,
        total_items,
        limit,
      },
      data: {
        transactions: paginatedTransactions,
      },
    };
  }

  async updateFeatures(id: string, updateUserFeaturesDto: UpdateUserFeaturesDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.userRepository.merge(user, updateUserFeaturesDto);
    return this.userRepository.save(user);
  }

  async updateLastLogin(id: string) {
    return this.userRepository.update(id, { lastLogin: new Date() });
  }
}