import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, EntityManager } from 'typeorm';
import { DigitalValueMaster } from './entities/digital-value-master.entity';
import { DigitalValueTransaction } from './entities/digital-value-transaction.entity';
import { RewardLinkage } from './entities/reward-linkage.entity';
import { CreateDigitalValueDto } from './dto/create-digital-value.dto';
import {
  DigitalValueStatus,
  DigitalValueTransactionType,
} from './digital-value.enums';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { FundDigitalValueDto } from './dto/fund-digital-value.dto';
import { RedeemDigitalValueDto } from './dto/redeem-digital-value.dto';
import { customAlphabet } from 'nanoid';

const generateNanoId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  16,
);

@Injectable()
export class DigitalValueService {
  constructor(
    @InjectRepository(DigitalValueMaster)
    private readonly digitalValueRepository: Repository<DigitalValueMaster>,
    @InjectRepository(DigitalValueTransaction)
    private readonly transactionRepository: Repository<DigitalValueTransaction>,
    @InjectRepository(RewardLinkage)
    private readonly rewardLinkageRepository: Repository<RewardLinkage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createDto: CreateDigitalValueDto,
    ownerId?: string,
    manager?: EntityManager,
  ): Promise<DigitalValueMaster> {
    const {
      type,
      initialValue,
      merchantId,
      expiryDate,
      rewardId,
      ownerId: targetOwnerId,
      metadata,
    } = createDto;

    const finalOwnerId = targetOwnerId || ownerId;
    let owner: User = null;
    if (finalOwnerId) {
      owner = await this.userRepository.findOneBy({ id: finalOwnerId });
      if (!owner) {
        throw new NotFoundException('Owner not found');
      }
    }

    let merchant: Business = null;
    if (merchantId) {
      merchant = await this.businessRepository.findOneBy({ id: merchantId });
      if (!merchant) {
        throw new NotFoundException('Merchant not found');
      }
    }

    return this.runInTransaction(async (transactionalManager) => {
      const code = generateNanoId();

      const digitalValue = transactionalManager.create(DigitalValueMaster, {
        code,
        type,
        owner,
        merchant,
        initialValue,
        currentBalance: initialValue,
        status:
          initialValue > 0
            ? DigitalValueStatus.ACTIVE
            : DigitalValueStatus.DRAFT,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        metadata: metadata || {},
      });

      const savedDigitalValue = await transactionalManager.save(
        DigitalValueMaster,
        digitalValue,
      );

      if (initialValue > 0) {
        const transaction = transactionalManager.create(
          DigitalValueTransaction,
          {
            digitalValue: savedDigitalValue,
            amount: initialValue,
            type: DigitalValueTransactionType.FUND,
          },
        );
        await transactionalManager.save(DigitalValueTransaction, transaction);
      }

      if (rewardId) {
        const linkage = transactionalManager.create(RewardLinkage, {
          rewardId,
          digitalValue: savedDigitalValue,
        });
        await transactionalManager.save(RewardLinkage, linkage);
      }
      return savedDigitalValue;
    }, manager);
  }

  async fund(
    id: string,
    fundDto: FundDigitalValueDto,
    manager?: EntityManager,
  ): Promise<DigitalValueMaster> {
    const { amount } = fundDto;
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    return this.runInTransaction(async (transactionalManager) => {
      const digitalValue = await transactionalManager.findOne(
        DigitalValueMaster,
        {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!digitalValue) {
        throw new NotFoundException('Digital value instrument not found');
      }

      if (digitalValue.expiryDate && new Date() > digitalValue.expiryDate) {
        throw new BadRequestException('Cannot fund an expired instrument');
      }

      digitalValue.currentBalance =
        Number(digitalValue.currentBalance) + Number(amount);
      if (
        digitalValue.status === DigitalValueStatus.DRAFT ||
        digitalValue.status === DigitalValueStatus.FULLY_REDEEMED
      ) {
        digitalValue.status = DigitalValueStatus.ACTIVE;
      } else if (
        digitalValue.status === DigitalValueStatus.PARTIALLY_REDEEMED
      ) {
        digitalValue.status = DigitalValueStatus.ACTIVE;
      }

      await transactionalManager.save(DigitalValueMaster, digitalValue);

      const transaction = transactionalManager.create(DigitalValueTransaction, {
        digitalValue,
        amount,
        type: DigitalValueTransactionType.TOP_UP,
      });
      await transactionalManager.save(DigitalValueTransaction, transaction);

      return digitalValue;
    }, manager);
  }

  async redeem(
    id: string,
    redeemDto: RedeemDigitalValueDto,
    manager?: EntityManager,
  ): Promise<DigitalValueMaster> {
    const { amount, merchantId } = redeemDto;
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    return this.runInTransaction(async (transactionalManager) => {
      const digitalValue = await transactionalManager.findOne(
        DigitalValueMaster,
        {
          where: { id },
          relations: ['merchant'],
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!digitalValue) {
        throw new NotFoundException('Digital value instrument not found');
      }

      if (Number(digitalValue.currentBalance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      if (digitalValue.expiryDate && new Date() > digitalValue.expiryDate) {
        digitalValue.status = DigitalValueStatus.EXPIRED;
        await transactionalManager.save(DigitalValueMaster, digitalValue);
        throw new BadRequestException('Instrument has expired');
      }

      if (digitalValue.merchantId) {
        if (digitalValue.merchantId !== merchantId) {
          throw new BadRequestException(
            'This instrument is only valid for a specific merchant',
          );
        }
      }

      digitalValue.currentBalance =
        Number(digitalValue.currentBalance) - Number(amount);

      if (digitalValue.currentBalance === 0) {
        digitalValue.status = DigitalValueStatus.FULLY_REDEEMED;
      } else {
        digitalValue.status = DigitalValueStatus.PARTIALLY_REDEEMED;
      }

      await transactionalManager.save(DigitalValueMaster, digitalValue);

      const transaction = transactionalManager.create(DigitalValueTransaction, {
        digitalValue,
        amount, // Store absolute value
        type: DigitalValueTransactionType.REDEEM,
      });

      await transactionalManager.save(DigitalValueTransaction, transaction);

      return digitalValue;
    }, manager);
  }

  async getById(id: string): Promise<DigitalValueMaster> {
    const digitalValue = await this.digitalValueRepository.findOne({
      where: { id },
      relations: ['owner', 'merchant', 'transactions'],
    });
    if (!digitalValue) {
      throw new NotFoundException('Digital value instrument not found');
    }
    return digitalValue;
  }

  async getByUser(userId: string): Promise<DigitalValueMaster[]> {
    return this.digitalValueRepository.find({
      where: { owner: { id: userId } },
      relations: ['merchant'],
      order: { created_at: 'DESC' },
    });
  }

  async getByMerchant(merchantId: string): Promise<DigitalValueMaster[]> {
    return this.digitalValueRepository.find({
      where: { merchant: { id: merchantId } },
      relations: ['owner'],
      order: { created_at: 'DESC' },
    });
  }

  async getTransactions(id: string): Promise<DigitalValueTransaction[]> {
    return this.transactionRepository.find({
      where: { digitalValue: { id } },
      order: { timestamp: 'DESC' },
    });
  }

  async linkMerchant(
    id: string,
    merchantId: string,
    userId: string,
  ): Promise<DigitalValueMaster> {
    const digitalValue = await this.digitalValueRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!digitalValue) {
      throw new NotFoundException('Digital value instrument not found');
    }

    if (digitalValue.owner.id !== userId) {
      throw new ForbiddenException('You do not own this instrument');
    }

    if (digitalValue.merchantId) {
      throw new BadRequestException('Already linked to a merchant');
    }

    const merchant = await this.businessRepository.findOneBy({
      id: merchantId,
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    digitalValue.merchant = merchant;

    return this.digitalValueRepository.save(digitalValue);
  }

  async validateMerchantOwnership(
    merchantId: string,
    userId: string,
  ): Promise<void> {
    const merchant = await this.businessRepository.findOne({
      where: { id: merchantId },
      relations: ['user'],
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }
    if (merchant.user.id !== userId) {
      throw new ForbiddenException('You do not own this merchant');
    }
  }

  async getTransactionsByMerchant(
    merchantId: string,
  ): Promise<DigitalValueTransaction[]> {
    return this.transactionRepository.find({
      where: { digitalValue: { merchant: { id: merchantId } } },
      relations: ['digitalValue'],
      order: { timestamp: 'DESC' },
    });
  }

  async getAll(): Promise<DigitalValueMaster[]> {
    return this.digitalValueRepository.find({
      relations: ['owner', 'merchant'],
      order: { created_at: 'DESC' },
    });
  }

  async getByCode(code: string): Promise<DigitalValueMaster> {
    const digitalValue = await this.digitalValueRepository.findOne({
      where: { code },
      relations: ['owner', 'merchant'],
    });
    if (!digitalValue) {
      throw new NotFoundException('Digital value instrument not found');
    }
    return digitalValue;
  }

  private async runInTransaction<T>(
    operation: (manager: EntityManager) => Promise<T>,
    externalManager?: EntityManager,
  ): Promise<T> {
    if (externalManager) {
      return operation(externalManager);
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // In tests, queryRunner.manager might be mocked. Ensure it has required methods.
      // If using TypeORM's EntityManager, it should be fine.
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
