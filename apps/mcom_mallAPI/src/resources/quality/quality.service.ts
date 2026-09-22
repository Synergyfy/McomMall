import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionStatus, QualityMission } from './entities/quality-mission.entity';
import { Business } from '../listings/entities/listing.entity';
import { CreateQualityMissionDto } from './dto/create-quality-mission.dto';
import { UpdateQualityMissionDto } from './dto/update-quality-mission.dto';

@Injectable()
export class QualityService {
  constructor(
    @InjectRepository(QualityMission)
    private readonly missionRepository: Repository<QualityMission>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async create(dto: CreateQualityMissionDto): Promise<QualityMission> {
    const business = await this.businessRepository.findOne({ where: { id: dto.businessId } });
    if (!business) {
      throw new NotFoundException(`Business with ID ${dto.businessId} was not found`);
    }
    const mission = this.missionRepository.create(dto);
    return this.missionRepository.save(mission);
  }

  async findAll(status?: MissionStatus): Promise<QualityMission[]> {
    return this.missionRepository.find({
      where: status ? { status } : {},
      relations: ['business'],
      order: { created_at: 'DESC' },
    });
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    avgScore: number;
  }> {
    const [total, pending, inProgress, completed, avgRow] = await Promise.all([
      this.missionRepository.count(),
      this.missionRepository.count({ where: { status: MissionStatus.PENDING } }),
      this.missionRepository.count({ where: { status: MissionStatus.IN_PROGRESS } }),
      this.missionRepository.count({ where: { status: MissionStatus.COMPLETED } }),
      this.missionRepository
        .createQueryBuilder('mission')
        .select('AVG(mission.score)', 'avg')
        .where('mission.score IS NOT NULL')
        .getRawOne(),
    ]);
    return {
      total,
      pending,
      inProgress,
      completed,
      avgScore: Math.round(Number(avgRow?.avg ?? 0) * 10) / 10,
    };
  }

  async findOne(id: string): Promise<QualityMission> {
    const mission = await this.missionRepository.findOne({
      where: { id },
      relations: ['business'],
    });
    if (!mission) {
      throw new NotFoundException(`Quality mission with ID ${id} was not found`);
    }
    return mission;
  }

  async update(id: string, dto: UpdateQualityMissionDto): Promise<QualityMission> {
    const mission = await this.findOne(id);
    if (dto.businessId && dto.businessId !== mission.businessId) {
      const business = await this.businessRepository.findOne({ where: { id: dto.businessId } });
      if (!business) {
        throw new NotFoundException(`Business with ID ${dto.businessId} was not found`);
      }
    }
    Object.assign(mission, dto);
    return this.missionRepository.save(mission);
  }

  async remove(id: string): Promise<void> {
    const mission = await this.findOne(id);
    await this.missionRepository.remove(mission);
  }
}
