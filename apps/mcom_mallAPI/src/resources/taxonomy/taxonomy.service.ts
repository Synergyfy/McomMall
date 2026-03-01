import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from './entities/sector.entity';
import { TaxonomyCategory } from './entities/taxonomy-category.entity';
import { TaxonomySubcategory } from './entities/taxonomy-subcategory.entity';
import { CreateSectorDto } from './dto/create-sector.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class TaxonomyService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(TaxonomyCategory)
    private readonly categoryRepository: Repository<TaxonomyCategory>,
    @InjectRepository(TaxonomySubcategory)
    private readonly subcategoryRepository: Repository<TaxonomySubcategory>,
  ) {}

  // --- Sectors ---

  async createSector(createSectorDto: CreateSectorDto): Promise<Sector> {
    const existing = await this.sectorRepository.findOne({
      where: { name: createSectorDto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Sector with name "${createSectorDto.name}" already exists`,
      );
    }
    const sector = this.sectorRepository.create(createSectorDto);
    return this.sectorRepository.save(sector);
  }

  async findAllSectors(): Promise<Sector[]> {
    return this.sectorRepository.find();
  }

  async findOneSector(id: string): Promise<Sector> {
    const sector = await this.sectorRepository.findOne({ where: { id } });
    if (!sector) {
      throw new NotFoundException(`Sector with ID "${id}" not found`);
    }
    return sector;
  }

  async updateSector(
    id: string,
    updateSectorDto: UpdateSectorDto,
  ): Promise<Sector> {
    const sector = await this.findOneSector(id);

    if (updateSectorDto.name && updateSectorDto.name !== sector.name) {
      const existing = await this.sectorRepository.findOne({
        where: { name: updateSectorDto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Sector with name "${updateSectorDto.name}" already exists`,
        );
      }
    }

    this.sectorRepository.merge(sector, updateSectorDto);
    return this.sectorRepository.save(sector);
  }

  async removeSector(id: string): Promise<void> {
    const sector = await this.findOneSector(id);
    await this.sectorRepository.remove(sector);
  }

  // --- Categories ---

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<TaxonomyCategory> {
    // Validate sector exists
    await this.findOneSector(createCategoryDto.sectorId);

    const existing = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists`,
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<TaxonomyCategory[]> {
    return this.categoryRepository.find();
  }

  async findAllCategoriesAll(): Promise<TaxonomyCategory[]> {
    return this.categoryRepository.find({
      relations: ['sector'],
      order: { name: 'ASC' },
    });
  }

  async findCategoriesBySector(sectorId: string): Promise<TaxonomyCategory[]> {
    return this.categoryRepository.find({ where: { sectorId } });
  }

  async findOneCategory(id: string): Promise<TaxonomyCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<TaxonomyCategory> {
    const category = await this.findOneCategory(id);

    if (updateCategoryDto.sectorId) {
      await this.findOneSector(updateCategoryDto.sectorId);
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`,
        );
      }
    }

    this.categoryRepository.merge(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);
    await this.categoryRepository.remove(category);
  }

  // --- Subcategories ---

  async createSubcategory(
    createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<TaxonomySubcategory> {
    // Validate category exists
    await this.findOneCategory(createSubcategoryDto.categoryId);

    const existing = await this.subcategoryRepository.findOne({
      where: { name: createSubcategoryDto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Subcategory with name "${createSubcategoryDto.name}" already exists`,
      );
    }

    const subcategory = this.subcategoryRepository.create(createSubcategoryDto);
    return this.subcategoryRepository.save(subcategory);
  }

  async findSubcategoriesByCategory(
    categoryId: string,
  ): Promise<TaxonomySubcategory[]> {
    return this.subcategoryRepository.find({ where: { categoryId } });
  }

  async findOneSubcategory(id: string): Promise<TaxonomySubcategory> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
    });
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID "${id}" not found`);
    }
    return subcategory;
  }

  async updateSubcategory(
    id: string,
    updateSubcategoryDto: UpdateSubcategoryDto,
  ): Promise<TaxonomySubcategory> {
    const subcategory = await this.findOneSubcategory(id);

    if (updateSubcategoryDto.categoryId) {
      await this.findOneCategory(updateSubcategoryDto.categoryId);
    }

    if (
      updateSubcategoryDto.name &&
      updateSubcategoryDto.name !== subcategory.name
    ) {
      const existing = await this.subcategoryRepository.findOne({
        where: { name: updateSubcategoryDto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Subcategory with name "${updateSubcategoryDto.name}" already exists`,
        );
      }
    }

    this.subcategoryRepository.merge(subcategory, updateSubcategoryDto);
    return this.subcategoryRepository.save(subcategory);
  }

  async removeSubcategory(id: string): Promise<void> {
    const subcategory = await this.findOneSubcategory(id);
    await this.subcategoryRepository.remove(subcategory);
  }
}
