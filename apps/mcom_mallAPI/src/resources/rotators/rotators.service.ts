import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rotator } from './entities/rotator.entity';
import { Business } from '../listings/entities/listing.entity';
import { CreateRotatorDto } from './dto/create-rotator.dto';
import { UpdateRotatorDto } from './dto/update-rotator.dto';

@Injectable()
export class RotatorsService {
  constructor(
    @InjectRepository(Rotator)
    private readonly rotatorRepository: Repository<Rotator>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async create(userId: string, createRotatorDto: CreateRotatorDto): Promise<Rotator> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new NotFoundException('No business found for the current merchant user');
    }

    const rotator = this.rotatorRepository.create({
      ...createRotatorDto,
      businessId: business.id,
      status: createRotatorDto.status || 'active',
    });

    return this.rotatorRepository.save(rotator);
  }

  async findAllForBusiness(userId: string): Promise<Rotator[]> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new NotFoundException('No business found for the current merchant user');
    }

    return this.rotatorRepository.find({
      where: { businessId: business.id },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Rotator> {
    const rotator = await this.rotatorRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!rotator) {
      throw new NotFoundException(`Rotator with ID "${id}" not found`);
    }

    return rotator;
  }

  async update(id: string, updateRotatorDto: UpdateRotatorDto): Promise<Rotator> {
    const rotator = await this.findOne(id);
    const updated = this.rotatorRepository.merge(rotator, updateRotatorDto);
    return this.rotatorRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const rotator = await this.findOne(id);
    await this.rotatorRepository.remove(rotator);
  }

  async duplicate(id: string): Promise<Rotator> {
    const original = await this.findOne(id);

    const clone = this.rotatorRepository.create({
      title: `${original.title} (Copy)`,
      rotatorType: original.rotatorType,
      rotationSpeed: original.rotationSpeed,
      priority: original.priority,
      visibility: original.visibility,
      boroughTarget: original.boroughTarget,
      storefrontTarget: original.storefrontTarget,
      contentIds: original.contentIds,
      status: 'draft', // duplicated campaigns are placed in draft state by default
      businessId: original.businessId,
    });

    return this.rotatorRepository.save(clone);
  }
}
