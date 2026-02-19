import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { DigitalValue, DigitalValueType, DigitalValueStatus, DigitalValueDeliveryStatus } from './entities/digital-value.entity';
import { DigitalValueTransaction, DigitalValueTransactionType, DigitalValueTransactionStatus } from './entities/digital-value-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DigitalValueService {
  constructor(
    @InjectRepository(DigitalValue)
    private readonly digitalValueRepository: Repository<DigitalValue>,
    @InjectRepository(DigitalValueTransaction)
    private readonly transactionRepository: Repository<DigitalValueTransaction>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: Partial<DigitalValue>): Promise<DigitalValue> {
    const code = data.code || this.generateCode();
    const digitalValue = this.digitalValueRepository.create({
      ...data,
      code,
      status: DigitalValueStatus.DRAFT,
      currentBalance: 0,
    });
    return this.digitalValueRepository.save(digitalValue);
  }

  async fund(id: string, amount: number, metadata?: any): Promise<DigitalValue> {
    const digitalValue = await this.findOne(id);
    if (!digitalValue) throw new NotFoundException('Digital Value not found');

    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    digitalValue.currentBalance = Number(digitalValue.currentBalance) + Number(amount);
    digitalValue.status = DigitalValueStatus.FUNDED; // Or ACTIVE depending on logic

    // If fully funded to initial balance or more, mark active?
    if (digitalValue.currentBalance >= digitalValue.initialBalance) {
        digitalValue.status = DigitalValueStatus.ACTIVE;
    }

    const transaction = this.transactionRepository.create({
      digitalValue,
      amount,
      type: DigitalValueTransactionType.FUND,
      status: DigitalValueTransactionStatus.COMPLETED,
      metadata,
    });

    await this.transactionRepository.save(transaction);
    return this.digitalValueRepository.save(digitalValue);
  }

  async topUp(id: string, amount: number, metadata?: any): Promise<DigitalValue> {
    const digitalValue = await this.findOne(id);
    if (!digitalValue) throw new NotFoundException('Digital Value not found');

    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    digitalValue.currentBalance = Number(digitalValue.currentBalance) + Number(amount);

    const transaction = this.transactionRepository.create({
      digitalValue,
      amount,
      type: DigitalValueTransactionType.TOPUP,
      status: DigitalValueTransactionStatus.COMPLETED,
      metadata,
    });

    await this.transactionRepository.save(transaction);
    return this.digitalValueRepository.save(digitalValue);
  }

  async redeem(id: string, amount: number, merchantId?: string, metadata?: any): Promise<DigitalValue> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const digitalValue = await queryRunner.manager.findOne(DigitalValue, {
        where: { id },
        relations: ['merchant']
      });

      if (!digitalValue) throw new NotFoundException('Digital Value not found');

      if (digitalValue.status !== DigitalValueStatus.ACTIVE && digitalValue.status !== DigitalValueStatus.PARTIALLY_REDEEMED) {
          throw new BadRequestException(`Digital Value is not active (status: ${digitalValue.status})`);
      }

      if (digitalValue.expiryDate && new Date() > digitalValue.expiryDate) {
          digitalValue.status = DigitalValueStatus.EXPIRED;
          await queryRunner.manager.save(digitalValue);
          throw new BadRequestException('Digital Value has expired');
      }

      // Merchant Linking Logic
      if (digitalValue.merchantId && merchantId && digitalValue.merchantId !== merchantId) {
          throw new BadRequestException('This Digital Value is linked to a specific merchant and cannot be used here.');
      }

      // If merchant specific, but no merchantId provided in redeem?
      // Assuming context provides merchantId.

      if (Number(digitalValue.currentBalance) < amount) {
          throw new BadRequestException('Insufficient balance');
      }

      digitalValue.currentBalance = Number(digitalValue.currentBalance) - Number(amount);

      if (digitalValue.currentBalance === 0) {
          digitalValue.status = DigitalValueStatus.FULLY_REDEEMED;
      } else {
          digitalValue.status = DigitalValueStatus.PARTIALLY_REDEEMED;
      }

      const transaction = this.transactionRepository.create({
        digitalValue,
        amount,
        type: DigitalValueTransactionType.REDEEM,
        status: DigitalValueTransactionStatus.COMPLETED,
        metadata: { ...metadata, merchantId },
      });

      await queryRunner.manager.save(transaction);
      const saved = await queryRunner.manager.save(digitalValue);

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async linkMerchant(id: string, merchantId: string): Promise<DigitalValue> {
    const digitalValue = await this.findOne(id);
    if (!digitalValue) throw new NotFoundException('Digital Value not found');

    const merchant = await this.businessRepository.findOne({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    digitalValue.merchant = merchant;
    return this.digitalValueRepository.save(digitalValue);
  }

  async findOne(id: string): Promise<DigitalValue> {
    return this.digitalValueRepository.findOne({
        where: { id },
        relations: ['merchant', 'owner', 'purchaser']
    });
  }

  async findByCode(code: string): Promise<DigitalValue> {
    return this.digitalValueRepository.findOne({
        where: { code },
        relations: ['merchant', 'owner', 'purchaser']
    });
  }

  private generateCode(): string {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  }
}
