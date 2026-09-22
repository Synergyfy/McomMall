import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expo, ExpoStatus } from './entities/expo.entity';
import { CreateExpoDto } from './dto/create-expo.dto';
import { UpdateExpoDto } from './dto/update-expo.dto';

@Injectable()
export class ExposService {
  constructor(
    @InjectRepository(Expo)
    private readonly expoRepository: Repository<Expo>,
  ) {}

  async create(dto: CreateExpoDto): Promise<Expo> {
    const expo = this.expoRepository.create(dto);
    return this.expoRepository.save(expo);
  }

  async findAll(status?: ExpoStatus, boroughId?: string): Promise<Expo[]> {
    return this.expoRepository.find({
      where: {
        ...(status ? { status } : {}),
        ...(boroughId ? { boroughId } : {}),
      },
      relations: ['borough'],
      order: { startDate: 'ASC', created_at: 'DESC' },
    });
  }

  async getStats(): Promise<{
    total: number;
    planning: number;
    upcoming: number;
    active: number;
    ended: number;
  }> {
    const [total, planning, upcoming, active, ended] = await Promise.all([
      this.expoRepository.count(),
      this.expoRepository.count({ where: { status: ExpoStatus.PLANNING } }),
      this.expoRepository.count({ where: { status: ExpoStatus.UPCOMING } }),
      this.expoRepository.count({ where: { status: ExpoStatus.ACTIVE } }),
      this.expoRepository.count({ where: { status: ExpoStatus.ENDED } }),
    ]);
    return { total, planning, upcoming, active, ended };
  }

  async findOne(id: string): Promise<Expo> {
    const expo = await this.expoRepository.findOne({
      where: { id },
      relations: ['borough'],
    });
    if (!expo) {
      throw new NotFoundException(`Expo with ID ${id} was not found`);
    }
    return expo;
  }

  async update(id: string, dto: UpdateExpoDto): Promise<Expo> {
    const expo = await this.findOne(id);
    Object.assign(expo, dto);
    return this.expoRepository.save(expo);
  }

  async remove(id: string): Promise<void> {
    const expo = await this.findOne(id);
    await this.expoRepository.remove(expo);
  }
}
