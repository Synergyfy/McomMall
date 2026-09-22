import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HighStreet, HighStreetStatus } from './entities/high-street.entity';
import { CreateHighStreetDto } from './dto/create-high-street.dto';
import { UpdateHighStreetDto } from './dto/update-high-street.dto';

@Injectable()
export class HighStreetsService {
  constructor(
    @InjectRepository(HighStreet)
    private readonly highStreetRepository: Repository<HighStreet>,
  ) {}

  async create(dto: CreateHighStreetDto): Promise<HighStreet> {
    const street = this.highStreetRepository.create(dto);
    return this.highStreetRepository.save(street);
  }

  async findAll(status?: string, boroughId?: string): Promise<HighStreet[]> {
    return this.highStreetRepository.find({
      where: {
        ...(status ? { status: status as HighStreet['status'] } : {}),
        ...(boroughId ? { boroughId } : {}),
      },
      relations: ['borough'],
      order: { name: 'ASC' },
    });
  }

  async getStats(): Promise<{ total: number; active: number; pending: number }> {
    const [total, active, pending] = await Promise.all([
      this.highStreetRepository.count(),
      this.highStreetRepository.count({ where: { status: HighStreetStatus.ACTIVE } }),
      this.highStreetRepository.count({ where: { status: HighStreetStatus.PENDING } }),
    ]);
    return { total, active, pending };
  }

  async findOne(id: string): Promise<HighStreet> {
    const street = await this.highStreetRepository.findOne({
      where: { id },
      relations: ['borough'],
    });
    if (!street) {
      throw new NotFoundException(`High street with ID ${id} was not found`);
    }
    return street;
  }

  async update(id: string, dto: UpdateHighStreetDto): Promise<HighStreet> {
    const street = await this.findOne(id);
    Object.assign(street, dto);
    return this.highStreetRepository.save(street);
  }

  async remove(id: string): Promise<void> {
    const street = await this.findOne(id);
    await this.highStreetRepository.remove(street);
  }
}
