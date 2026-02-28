import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GiftCardAsset } from './entities/gift-card-asset.entity';
import { CreateGiftCardAssetDto } from './dto/create-gift-card-asset.dto';
import { UpdateGiftCardAssetDto } from './dto/update-gift-card-asset.dto';
import { User } from '../users/entities/user.entity';
import { AssetCategory } from './entities/asset-category.entity';

@Injectable()
export class GiftCardAssetService {
  constructor(
    @InjectRepository(GiftCardAsset)
    private readonly giftCardAssetRepository: Repository<GiftCardAsset>,
    @InjectRepository(AssetCategory)
    private readonly assetCategoryRepository: Repository<AssetCategory>,
  ) {}

  private async getAndVerifyUserCategories(
    categoryIds: string[],
    user: User,
  ): Promise<AssetCategory[]> {
    if (!categoryIds || categoryIds.length === 0) {
      return [];
    }

    const categories = await this.assetCategoryRepository.find({
      where: { id: In(categoryIds), ownerId: user.id },
    });

    if (categories.length !== categoryIds.length) {
      const foundIds = categories.map((c) => c.id);
      const notFoundIds = categoryIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `The following categories were not found or do not belong to you: ${notFoundIds.join(', ')}`,
      );
    }
    return categories;
  }

  async create(
    createDto: CreateGiftCardAssetDto,
    user: User,
  ): Promise<GiftCardAsset> {
    const { assetCategoryIds, ...rest } = createDto;
    const categories = await this.getAndVerifyUserCategories(
      assetCategoryIds,
      user,
    );

    const newAsset = this.giftCardAssetRepository.create({
      ...rest,
      owner: user,
      categories,
    });
    return this.giftCardAssetRepository.save(newAsset);
  }

  findAll(user: User): Promise<GiftCardAsset[]> {
    return this.giftCardAssetRepository.find({
      where: { ownerId: user.id },
      relations: ['categories'],
    });
  }

  findAssetsByOwner(ownerId: string): Promise<GiftCardAsset[]> {
    return this.giftCardAssetRepository.find({
      where: { ownerId },
      relations: ['categories'],
    });
  }

  async findOne(id: string, user: User): Promise<GiftCardAsset> {
    const asset = await this.giftCardAssetRepository.findOne({
      where: { id, ownerId: user.id },
      relations: ['categories'],
    });
    if (!asset) {
      throw new NotFoundException(`Gift card asset with ID "${id}" not found`);
    }
    return asset;
  }

  async update(
    id: string,
    updateDto: UpdateGiftCardAssetDto,
    user: User,
  ): Promise<GiftCardAsset> {
    const asset = await this.findOne(id, user);
    const { assetCategoryIds, ...rest } = updateDto;

    if (assetCategoryIds !== undefined) {
      asset.categories = await this.getAndVerifyUserCategories(
        assetCategoryIds,
        user,
      );
    }

    Object.assign(asset, rest);
    return this.giftCardAssetRepository.save(asset);
  }

  async remove(id: string, user: User): Promise<void> {
    const asset = await this.findOne(id, user);
    await this.giftCardAssetRepository.remove(asset);
  }
}
