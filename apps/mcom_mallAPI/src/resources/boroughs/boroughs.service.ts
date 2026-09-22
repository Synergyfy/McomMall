import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borough } from './entities/borough.entity';
import { BoroughCampaign } from '../visibility/entities/borough-campaign.entity';
import { CreateBoroughDto } from './dto/create-borough.dto';
import { UpdateBoroughDto } from './dto/update-borough.dto';

@Injectable()
export class BoroughsService {
  constructor(
    @InjectRepository(Borough)
    private readonly boroughRepository: Repository<Borough>,
    @InjectRepository(BoroughCampaign)
    private readonly campaignRepository: Repository<BoroughCampaign>,
  ) {}

  async create(dto: CreateBoroughDto): Promise<Borough> {
    const existing = await this.boroughRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Borough "${dto.name}" already exists`);
    }
    const borough = this.boroughRepository.create(dto);
    return this.boroughRepository.save(borough);
  }

  async findAll(): Promise<Borough[]> {
    return this.boroughRepository.find({ order: { name: 'ASC' } });
  }

  async getStats(): Promise<{ total: number; active: number; inactive: number }> {
    const [total, active] = await Promise.all([
      this.boroughRepository.count(),
      this.boroughRepository.count({ where: { isActive: true } }),
    ]);
    return { total, active, inactive: total - active };
  }

  async findOne(id: string): Promise<Borough> {
    const borough = await this.boroughRepository.findOne({
      where: { id },
      relations: ['campaigns'],
    });
    if (!borough) {
      throw new NotFoundException(`Borough with ID ${id} was not found`);
    }
    return borough;
  }

  async getCampaigns(id: string): Promise<BoroughCampaign[]> {
    await this.findOne(id);
    return this.campaignRepository.find({
      where: { boroughId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateBoroughDto): Promise<Borough> {
    const borough = await this.findOne(id);
    if (dto.name && dto.name !== borough.name) {
      const existing = await this.boroughRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(`Borough "${dto.name}" already exists`);
      }
    }
    Object.assign(borough, dto);
    return this.boroughRepository.save(borough);
  }

  async remove(id: string): Promise<void> {
    const borough = await this.findOne(id);
    await this.boroughRepository.remove(borough);
  }
}
