import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategory } from './entities/asset-category.entity';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { UpdateAssetCategoryDto } from './dto/update-asset-category.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AssetCategoryService {
  constructor(
    @InjectRepository(AssetCategory)
    private readonly assetCategoryRepository: Repository<AssetCategory>,
  ) {}

  async create(
    createDto: CreateAssetCategoryDto,
    user: User,
  ): Promise<AssetCategory> {
    const category = this.assetCategoryRepository.create({
      ...createDto,
      owner: user,
    });
    return this.assetCategoryRepository.save(category);
  }

  async findAll(user: User): Promise<AssetCategory[]> {
    return this.assetCategoryRepository.find({
      where: { ownerId: user.id },
    });
  }

  async findOne(id: string, user: User): Promise<AssetCategory> {
    const category = await this.assetCategoryRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!category) {
      throw new NotFoundException(
        `Asset category with ID "${id}" not found or you do not have permission to access it.`,
      );
    }
    return category;
  }

  async update(
    id: string,
    updateDto: UpdateAssetCategoryDto,
    user: User,
  ): Promise<AssetCategory> {
    const category = await this.findOne(id, user);
    this.assetCategoryRepository.merge(category, updateDto);
    return this.assetCategoryRepository.save(category);
  }

  async remove(id: string, user: User): Promise<void> {
    const category = await this.findOne(id, user);
    await this.assetCategoryRepository.remove(category);
  }
}
