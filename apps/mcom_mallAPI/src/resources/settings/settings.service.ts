import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { Membership } from '../membership/entities/membership.entity';
import { MembershipPayment } from '../membership/entities/membership-payment.entity';
import { IntegrationSetting } from './entities/integration-setting.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { AppIntegration } from './entities/app-integration.entity';
import { ToggleAppIntegrationDto } from './dto/toggle-app-integration.dto';
import {
  CreatePaymentMethodDto,
  UpdateIntegrationSettingsDto,
} from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(IntegrationSetting)
    private readonly integrationRepository: Repository<IntegrationSetting>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(MembershipPayment)
    private readonly membershipPaymentRepository: Repository<MembershipPayment>,
    @InjectRepository(AppIntegration)
    private readonly appIntegrationRepository: Repository<AppIntegration>,
  ) {}

  async getIntegrations(businessId: string): Promise<IntegrationSetting> {
    let settings = await this.integrationRepository.findOne({
      where: { businessId },
    });
    if (!settings) {
      settings = this.integrationRepository.create({ businessId });
      settings = await this.integrationRepository.save(settings);
    }
    return settings;
  }

  async updateIntegrations(
    businessId: string,
    dto: UpdateIntegrationSettingsDto,
  ): Promise<IntegrationSetting> {
    const settings = await this.getIntegrations(businessId);
    Object.assign(settings, dto);
    return this.integrationRepository.save(settings);
  }

  async findPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async createPaymentMethod(
    userId: string,
    dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const existing = await this.paymentMethodRepository.find({
      where: { userId },
    });
    const isFirst = existing.length === 0;
    const method = this.paymentMethodRepository.create({
      ...dto,
      userId,
      isDefault: isFirst,
    });
    return this.paymentMethodRepository.save(method);
  }

  async removePaymentMethod(userId: string, id: string): Promise<void> {
    const method = await this.paymentMethodRepository.findOne({
      where: { id, userId },
    });
    if (!method) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    await this.paymentMethodRepository.remove(method);
  }

  async setDefaultPaymentMethod(
    userId: string,
    id: string,
  ): Promise<PaymentMethod> {
    const method = await this.paymentMethodRepository.findOne({
      where: { id, userId },
    });
    if (!method) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    await this.paymentMethodRepository.update({ userId }, { isDefault: false });
    method.isDefault = true;
    return this.paymentMethodRepository.save(method);
  }

  async getBilling(userId: string): Promise<any> {
    const [membership, payments, methods] = await Promise.all([
      this.membershipRepository.findOne({
        where: { user: { id: userId } },
        relations: ['planVariant', 'planVariant.plan', 'payment'],
      }),
      this.membershipPaymentRepository.find({
        where: { user: { id: userId } },
        order: { created_at: 'DESC' },
      }),
      this.findPaymentMethods(userId),
    ]);

    return {
      plan: membership?.planVariant
        ? {
            name: membership.planVariant.plan?.name ?? 'Plan',
            planType: membership.planType,
            expiresAt: membership.expiresAt,
            isActive: membership.isActive,
            isTrial: membership.isTrial,
          }
        : null,
      defaultPaymentMethod: methods.find((method) => method.isDefault) ?? null,
      paymentMethods: methods,
      invoices: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        createdAt: payment.created_at,
      })),
    };
  }

  async getAppIntegrations(ownerId: string): Promise<AppIntegration[]> {
    return this.appIntegrationRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async toggleAppIntegration(
    ownerId: string,
    dto: ToggleAppIntegrationDto,
  ): Promise<AppIntegration> {
    let integration = await this.appIntegrationRepository.findOne({
      where: { ownerId, appKey: dto.appKey },
    });

    if (!integration) {
      integration = this.appIntegrationRepository.create({
        ownerId,
        appKey: dto.appKey,
        isEnabled: dto.isEnabled,
        configJson: dto.configJson ?? {},
      });
    } else {
      integration.isEnabled = dto.isEnabled;
      if (dto.configJson) {
        integration.configJson = dto.configJson;
      }
    }

    return this.appIntegrationRepository.save(integration);
  }
}
