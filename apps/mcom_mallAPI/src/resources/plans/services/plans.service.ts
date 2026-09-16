import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { PlanTierLevel } from '../entities/plan-tier-level.entity';
import { PlanVariant } from '../entities/plan-variant.entity';
import { PlanPrice } from '../entities/plan-price.entity';
import { PlanTier } from '../enums/plan-tier.enum';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { CreatePlanPriceDto } from '../dto/create-plan-price.dto';
import { UpdatePlanDto, UpdatePlanVariantDto } from '../dto/update-plan.dto';

const REQUIRED_TIERS: PlanTier[] = [
  PlanTier.STANDARD,
  PlanTier.PRO,
  PlanTier.PRO_PLUS,
];

const TIER_SEEDS: Array<{
  name: PlanTier;
  sortOrder: number;
  durationDays: number | null;
  isCalendarYear: boolean;
}> = [
  {
    name: PlanTier.STANDARD,
    sortOrder: 1,
    durationDays: 90,
    isCalendarYear: false,
  },
  {
    name: PlanTier.PRO,
    sortOrder: 2,
    durationDays: 180,
    isCalendarYear: false,
  },
  {
    name: PlanTier.PRO_PLUS,
    sortOrder: 3,
    durationDays: null,
    isCalendarYear: true,
  },
];

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(PlanVariant)
    private readonly variantRepository: Repository<PlanVariant>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Resolves the sellable unit checkout needs: the variant (with its tier
   * level + plan) and its currently active versioned price.
   * Single joined query — callers must never price from client input.
   */
  async resolveActivePrice(
    variantId: string,
  ): Promise<{ variant: PlanVariant; price: PlanPrice }> {
    const variant = await this.variantRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.tierLevel', 'tierLevel')
      .leftJoinAndSelect('variant.plan', 'plan')
      .leftJoinAndSelect(
        'variant.prices',
        'price',
        'price.isActive = :active',
        {
          active: true,
        },
      )
      .where('variant.id = :id', { id: variantId })
      .getOne();

    if (!variant) {
      throw new NotFoundException(
        `Plan variant with ID ${variantId} not found`,
      );
    }
    const price = variant.prices?.find((candidate) => candidate.isActive);
    if (!price) {
      throw new BadRequestException(
        `Plan variant with ID ${variantId} has no active price`,
      );
    }
    return { variant, price };
  }

  /**
   * Creates one plan family with exactly its Standard, Pro and Pro+ variants,
   * each with its own price row, in a single transaction.
   */
  async create(dto: CreatePlanDto): Promise<Plan> {
    this.assertExactlyThreeTiers(dto);

    const existing = await this.planRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `Plan with slug "${dto.slug}" already exists`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const levels = await this.ensureTierLevels(
        queryRunner.manager.getRepository(PlanTierLevel),
      );
      const levelByName = new Map(levels.map((level) => [level.name, level]));

      const plan = await queryRunner.manager.save(
        queryRunner.manager.create(Plan, {
          name: dto.name,
          slug: dto.slug,
          description: dto.description ?? null,
          isActive: true,
        }),
      );

      for (const variantDto of dto.variants) {
        const level = levelByName.get(variantDto.tier);
        if (!level) {
          throw new BadRequestException(`Unknown tier "${variantDto.tier}"`);
        }
        const variant = await queryRunner.manager.save(
          queryRunner.manager.create(PlanVariant, {
            planId: plan.id,
            tierLevelId: level.id,
            isActive: true,
            features: variantDto.features ?? [],
            configuration: {
              quotas: { ...variantDto.configuration.quotas },
              featureFlags: { ...variantDto.configuration.featureFlags },
              disabledNavIds: variantDto.configuration.disabledNavIds ?? [],
            },
          }),
        );
        await queryRunner.manager.save(
          queryRunner.manager.create(PlanPrice, {
            planVariantId: variant.id,
            currency: 'GBP',
            amount: Number(variantDto.price),
            stripePriceId: variantDto.stripePriceId ?? null,
            paypalPlanId: variantDto.paypalPlanId ?? null,
            isActive: true,
          }),
        );
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Created plan "${dto.slug}" with 3 variants`);
      return this.findOne(plan.id);
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          `Plan with slug "${dto.slug}" already exists`,
        );
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create plan "${dto.slug}": ${message}`);
      throw new BadRequestException(`Failed to create plan: ${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /** Single joined query — no per-variant lazy loads (N+1 rule). */
  async findAll(): Promise<Plan[]> {
    return this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.variants', 'variant')
      .leftJoinAndSelect('variant.tierLevel', 'tierLevel')
      .leftJoinAndSelect(
        'variant.prices',
        'price',
        'price.isActive = :active',
        { active: true },
      )
      .orderBy('plan.created_at', 'DESC')
      .addOrderBy('tierLevel.sortOrder', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.variants', 'variant')
      .leftJoinAndSelect('variant.tierLevel', 'tierLevel')
      .leftJoinAndSelect(
        'variant.prices',
        'price',
        'price.isActive = :active',
        { active: true },
      )
      .where('plan.id = :id', { id })
      .orderBy('tierLevel.sortOrder', 'ASC')
      .getOne();

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  /**
   * Updates plan family fields (name/slug/description/isActive).
   * Variant contents are edited via updateVariant; prices via createPrice
   * (versioned, never mutated).
   */
  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    if (dto.slug && dto.slug !== plan.slug) {
      const clash = await this.planRepository.findOne({
        where: { slug: dto.slug },
      });
      if (clash) {
        throw new ConflictException(
          `Plan with slug "${dto.slug}" already exists`,
        );
      }
    }

    Object.assign(plan, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ?? null }
        : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    });

    try {
      await this.planRepository.save(plan);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          `Plan with slug "${dto.slug}" already exists`,
        );
      }
      throw error;
    }
    return this.findOne(id);
  }

  /**
   * Deletes a plan family. Variants, prices and variant-feature links cascade;
   * shared tier levels and the feature catalog are untouched.
   */
  async remove(id: string): Promise<void> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    await this.planRepository.remove(plan);
  }

  /**
   * Updates one variant's display features, enforced configuration and
   * active flag. Price changes are rejected here — use createPrice so
   * existing subscribers keep their locked-in price.
   */
  async updateVariant(
    variantId: string,
    dto: UpdatePlanVariantDto,
  ): Promise<PlanVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(
        `Plan variant with ID ${variantId} not found`,
      );
    }

    if (dto.features !== undefined) {
      variant.features = dto.features;
    }
    if (dto.configuration !== undefined) {
      variant.configuration = {
        quotas: { ...dto.configuration.quotas },
        featureFlags: { ...dto.configuration.featureFlags },
        disabledNavIds: dto.configuration.disabledNavIds ?? [],
      };
    }
    if (dto.isActive !== undefined) {
      variant.isActive = dto.isActive;
    }
    return this.variantRepository.save(variant);
  }

  /**
   * Versioned repricing: closes the active price row and inserts a new one,
   * so existing subscriptions keep their locked-in priceId snapshot.
   */
  async createPrice(
    variantId: string,
    dto: CreatePlanPriceDto,
  ): Promise<PlanPrice> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(
        `Plan variant with ID ${variantId} not found`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        PlanPrice,
        { planVariantId: variantId, isActive: true },
        { isActive: false, effectiveTo: new Date() },
      );
      const price = await queryRunner.manager.save(
        queryRunner.manager.create(PlanPrice, {
          planVariantId: variantId,
          currency: dto.currency ?? 'GBP',
          amount: Number(dto.amount),
          stripePriceId: dto.stripePriceId ?? null,
          paypalPlanId: dto.paypalPlanId ?? null,
          isActive: true,
        }),
      );
      await queryRunner.commitTransaction();
      return price;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to create price: ${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private assertExactlyThreeTiers(dto: CreatePlanDto): void {
    if (!Array.isArray(dto.variants)) {
      throw new BadRequestException('A plan must define its 3 variants');
    }
    const tiers = dto.variants.map((variant) => variant.tier);
    const unique = new Set(tiers);
    if (tiers.length !== 3 || unique.size !== 3) {
      throw new BadRequestException(
        'A plan must define exactly 3 variants (one per tier)',
      );
    }
    for (const required of REQUIRED_TIERS) {
      if (!unique.has(required)) {
        throw new BadRequestException(
          `Missing required variant tier "${required}"`,
        );
      }
    }
  }

  /** Postgres unique-violation code (slug / plan+variant races). */
  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === '23505'
    );
  }

  /** Seed-on-demand so fresh/dev databases work without a separate seed run. */
  private async ensureTierLevels(
    repository: Repository<PlanTierLevel>,
  ): Promise<PlanTierLevel[]> {
    const existing = await repository.find({
      where: { name: In(REQUIRED_TIERS) },
    });
    const missing = TIER_SEEDS.filter(
      (seed) => !existing.some((level) => level.name === seed.name),
    );
    if (missing.length > 0) {
      const created = await repository.save(
        missing.map((seed) => repository.create(seed)),
      );
      return [...existing, ...created];
    }
    return existing;
  }
}
