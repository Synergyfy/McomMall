import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariantTemplate } from './entities/product-variant-template.entity';
import { CreateProductVariantTemplateDto } from './dto/create-product-variant-template.dto';
import { UpdateProductVariantTemplateDto } from './dto/update-product-variant-template.dto';
import { ProductVariantTemplateSearchDto } from './dto/product-variant-template-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';

@Injectable()
export class ProductVariantTemplateService {
  constructor(
    @InjectRepository(ProductVariantTemplate)
    private readonly templateRepository: Repository<ProductVariantTemplate>,
  ) {}

  async create(createDto: CreateProductVariantTemplateDto): Promise<ProductVariantTemplate> {
    const template = this.templateRepository.create(createDto);
    return this.templateRepository.save(template);
  }

  async findAllPaginated(searchDto: ProductVariantTemplateSearchDto): Promise<PageDto<ProductVariantTemplate>> {
    const { page, limit, productType, category, subCategory, search } = searchDto;

    const queryBuilder = this.templateRepository.createQueryBuilder('template');

    if (productType) {
      queryBuilder.andWhere('template.productType = :productType', { productType });
    }

    if (category) {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    if (subCategory) {
      queryBuilder.andWhere('template.subCategory = :subCategory', { subCategory });
    }

    if (search) {
      queryBuilder.andWhere('template.name ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .orderBy('template.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      totalItems,
      itemCount: items.length,
      pageOptionsDto: searchDto as any,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findAll(): Promise<ProductVariantTemplate[]> {
    return this.templateRepository.find();
  }

  async findOne(id: string): Promise<ProductVariantTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Product variant template with ID ${id} not found`);
    }
    return template;
  }

  async findByFilter(productType: string, category?: string, subCategory?: string): Promise<ProductVariantTemplate[]> {
    const where: any = { productType };
    if (category) where.category = category;
    if (subCategory) where.subCategory = subCategory;

    return this.templateRepository.find({ where });
  }

  async update(id: string, updateDto: UpdateProductVariantTemplateDto): Promise<ProductVariantTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, updateDto);
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }
}
