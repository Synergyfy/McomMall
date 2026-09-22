import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingKind, TrainingModule } from './entities/training-module.entity';
import { CreateTrainingModuleDto } from './dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from './dto/update-training-module.dto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingModule)
    private readonly trainingRepository: Repository<TrainingModule>,
  ) {}

  async create(dto: CreateTrainingModuleDto): Promise<TrainingModule> {
    const module = this.trainingRepository.create(dto);
    return this.trainingRepository.save(module);
  }

  async findAll(kind?: TrainingKind, search?: string): Promise<TrainingModule[]> {
    const qb = this.trainingRepository
      .createQueryBuilder('module')
      .orderBy('module.created_at', 'DESC');
    if (kind) {
      qb.andWhere('module.kind = :kind', { kind });
    }
    if (search) {
      qb.andWhere('module.title ILIKE :search', { search: `%${search}%` });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<TrainingModule> {
    const module = await this.trainingRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Training module with ID ${id} was not found`);
    }
    return module;
  }

  async update(id: string, dto: UpdateTrainingModuleDto): Promise<TrainingModule> {
    const module = await this.findOne(id);
    Object.assign(module, dto);
    return this.trainingRepository.save(module);
  }

  async remove(id: string): Promise<void> {
    const module = await this.findOne(id);
    await this.trainingRepository.remove(module);
  }
}
