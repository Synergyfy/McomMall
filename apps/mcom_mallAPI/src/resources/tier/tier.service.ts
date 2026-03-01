import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tier } from './entities/tier.entity';
import { TierType } from './enums/tier-type.enum';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { SeasonsService } from '../seasons/seasons.service';

@Injectable()
export class TierService {
  constructor(
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    private readonly seasonsService: SeasonsService,
  ) {}

  async create(createTierDto: CreateTierDto): Promise<Tier> {
    try {
      if (createTierDto.type === TierType.SEASONAL) {
        if (!createTierDto.seasonId) {
          throw new BadRequestException('Seasonal tiers must have a seasonId');
        }
        await this.seasonsService.findOne(createTierDto.seasonId);
      }

      // Validation: Trial tiers must have duration
      if (createTierDto.type === TierType.TRIAL) {
        if (!createTierDto.trialDuration || createTierDto.trialDuration <= 0) {
          throw new BadRequestException(
            'Trial tiers must have a valid trialDuration greater than 0',
          );
        }

        // Global Upsert for Trial Tier: Check if one exists
        const existingTrial = await this.tierRepository.findOne({
          where: { type: TierType.TRIAL },
        });

        if (existingTrial) {
          // Update existing trial tier instead of creating new
          // We merge the new DTO into the existing entity
          const updateData = {
            ...createTierDto,
            monthlyPrice: Number(createTierDto.monthlyPrice || 0),
            quarterlyPrice: Number(createTierDto.quarterlyPrice || 0),
            annualPrice: Number(createTierDto.annualPrice || 0),
          };
          Object.assign(existingTrial, updateData);
          return await this.tierRepository.save(existingTrial);
        }
      }

      // Ensure prices are numbers and rounded to 2 decimal places
      const tierData = {
        ...createTierDto,
        monthlyPrice: Number(createTierDto.monthlyPrice || 0),
        quarterlyPrice: Number(createTierDto.quarterlyPrice || 0),
        annualPrice: Number(createTierDto.annualPrice || 0),
      };

      if (tierData.isDefault) {
        await this.clearDefaultTier();
      }

      const tier = this.tierRepository.create(tierData);
      return await this.tierRepository.save(tier);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException('Tier with this name already exists');
      }
      // Provide more context for database errors
      throw new InternalServerErrorException(
        `Failed to create tier: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Tier[]> {
    return await this.tierRepository.find();
  }

  async findOne(id: string): Promise<Tier> {
    const tier = await this.tierRepository.findOne({ where: { id } });
    if (!tier) {
      throw new NotFoundException(`Tier with ID ${id} not found`);
    }
    return tier;
  }

  async update(id: string, updateTierDto: UpdateTierDto): Promise<Tier> {
    const tier = await this.findOne(id);

    if (
      updateTierDto.type === TierType.SEASONAL ||
      (tier.type === TierType.SEASONAL && updateTierDto.seasonId)
    ) {
      const seasonId = updateTierDto.seasonId || tier.seasonId;
      if (!seasonId) {
        throw new BadRequestException('Seasonal tiers must have a seasonId');
      }
      await this.seasonsService.findOne(seasonId);
    }

    // Ensure prices are numbers and rounded if provided
    const updateData = { ...updateTierDto };
    if (updateData.monthlyPrice !== undefined)
      updateData.monthlyPrice = Number(updateData.monthlyPrice);
    if (updateData.quarterlyPrice !== undefined)
      updateData.quarterlyPrice = Number(updateData.quarterlyPrice);
    if (updateData.annualPrice !== undefined)
      updateData.annualPrice = Number(updateData.annualPrice);

    if (updateData.isDefault) {
      await this.clearDefaultTier(id);
    }

    // Validation for Trial Type updates
    if (updateTierDto.type === TierType.TRIAL) {
      // Check if we are changing type to TRIAL, ensure no OTHER trial exists
      if (tier.type !== TierType.TRIAL) {
        const existingTrial = await this.tierRepository.findOne({
          where: { type: TierType.TRIAL },
        });
        if (existingTrial && existingTrial.id !== id) {
          throw new ConflictException(
            'A Trial tier already exists. You can only have one Trial tier.',
          );
        }
      }

      // If changing to TRIAL (or updating existing TRIAL), must have duration
      const duration =
        updateTierDto.trialDuration !== undefined
          ? updateTierDto.trialDuration
          : tier.trialDuration;
      if (!duration || duration <= 0) {
        throw new BadRequestException(
          'Trial tiers must have a valid trialDuration greater than 0',
        );
      }
    }

    Object.assign(tier, updateData);
    try {
      return await this.tierRepository.save(tier);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException('Tier with this name already exists');
      }
      throw new InternalServerErrorException(
        `Failed to update tier: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const tier = await this.findOne(id);
    await this.tierRepository.remove(tier);
  }

  async findDefaultTier(): Promise<Tier | null> {
    return this.tierRepository.findOne({ where: { isDefault: true } });
  }

  private async clearDefaultTier(excludeId?: string): Promise<void> {
    const defaultTier = await this.findDefaultTier();
    if (defaultTier && defaultTier.id !== excludeId) {
      defaultTier.isDefault = false;
      await this.tierRepository.save(defaultTier);
    }
  }

  async findTrialTier(): Promise<Tier | null> {
    return this.tierRepository.findOne({
      where: { type: TierType.TRIAL, isActive: true },
    });
  }
}
