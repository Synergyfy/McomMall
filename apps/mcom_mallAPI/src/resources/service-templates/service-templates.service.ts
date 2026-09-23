import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceTemplate } from './entities/service-template.entity';
import { CreateServiceTemplateDto } from './dto/create-service-template.dto';
import { UpdateServiceTemplateDto } from './dto/update-service-template.dto';

@Injectable()
export class ServiceTemplatesService {
  constructor(
    @InjectRepository(ServiceTemplate)
    private readonly templateRepository: Repository<ServiceTemplate>,
  ) {}

  async create(dto: CreateServiceTemplateDto): Promise<ServiceTemplate> {
    const template = this.templateRepository.create({
      ...dto,
      packages: dto.packages ?? [],
    });
    return this.templateRepository.save(template);
  }

  async findAll(search?: string): Promise<ServiceTemplate[]> {
    const qb = this.templateRepository
      .createQueryBuilder('template')
      .orderBy('template.created_at', 'DESC');
    if (search) {
      qb.where(
        '(template.name ILIKE :search OR template.category ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<ServiceTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Service template with ID ${id} was not found`);
    }
    return template;
  }

  async update(id: string, dto: UpdateServiceTemplateDto): Promise<ServiceTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }
}
