import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashSaleItem } from './entities/flash-sale-item.entity';
import { FlashSaleStatus } from './flash-sale.enum';
import { CreateFlashSaleItemDto } from './dto/create-flash-sale-item.dto';
import { UpdateFlashSaleItemDto } from './dto/update-flash-sale-item.dto';

@Injectable()
export class FlashSalesService {
  constructor(
    @InjectRepository(FlashSaleItem)
    private readonly flashSaleItemRepository: Repository<FlashSaleItem>,
  ) {}

  private resolveStatus(item: FlashSaleItem): FlashSaleStatus {
    if (item.status === FlashSaleStatus.ENDED) {
      return FlashSaleStatus.ENDED;
    }
    const now = new Date();
    if (item.endDate <= now) {
      return FlashSaleStatus.ENDED;
    }
    return item.status;
  }

  async findAllActive(): Promise<FlashSaleItem[]> {
    const now = new Date();
    const items = await this.flashSaleItemRepository
      .createQueryBuilder('fsi')
      .where('fsi.status = :active', { active: FlashSaleStatus.ACTIVE })
      .andWhere('fsi.endDate > :now', { now })
      .orderBy('fsi.endDate', 'ASC')
      .getMany();

    return items.map((item) => ({
      ...item,
      status: this.resolveStatus(item),
    }));
  }

  async findAll(): Promise<FlashSaleItem[]> {
    return this.flashSaleItemRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FlashSaleItem> {
    const item = await this.flashSaleItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Flash sale item with ID "${id}" not found`);
    }
    return { ...item, status: this.resolveStatus(item) };
  }

  async create(dto: CreateFlashSaleItemDto): Promise<FlashSaleItem> {
    const item = this.flashSaleItemRepository.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: new Date(dto.endDate),
      status: dto.status ?? FlashSaleStatus.ACTIVE,
    });

    if (item.startDate >= item.endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    return this.flashSaleItemRepository.save(item);
  }

  async update(
    id: string,
    dto: UpdateFlashSaleItemDto,
  ): Promise<FlashSaleItem> {
    const item = await this.findOne(id);
    const merged = this.flashSaleItemRepository.merge(item, dto);
    if (dto.endDate) {
      merged.endDate = new Date(dto.endDate);
    }
    if (dto.startDate) {
      merged.startDate = new Date(dto.startDate);
    }
    return this.flashSaleItemRepository.save(merged);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.flashSaleItemRepository.remove(item);
  }
}
