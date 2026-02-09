import { ConflictException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tier } from './entities/tier.entity';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';

@Injectable()
export class TierService {
  constructor(
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
  ) {}

  async create(createTierDto: CreateTierDto): Promise<Tier> {
    try {
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
      if (error.code === '23505') {
        throw new ConflictException('Tier with this name already exists');
      }
      // Provide more context for database errors
      throw new InternalServerErrorException(`Failed to create tier: ${error.message}`);
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
    
    // Ensure prices are numbers and rounded if provided
    const updateData = { ...updateTierDto };
    if (updateData.monthlyPrice !== undefined) updateData.monthlyPrice = Number(updateData.monthlyPrice);
    if (updateData.quarterlyPrice !== undefined) updateData.quarterlyPrice = Number(updateData.quarterlyPrice);
    if (updateData.annualPrice !== undefined) updateData.annualPrice = Number(updateData.annualPrice);

    if (updateData.isDefault) {
      await this.clearDefaultTier(id);
    }

    Object.assign(tier, updateData);
    try {
      return await this.tierRepository.save(tier);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Tier with this name already exists');
      }
      throw new InternalServerErrorException(`Failed to update tier: ${error.message}`);
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
}
