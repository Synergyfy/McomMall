import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { MarketingCampaign } from './entities/marketing-campaign.entity';
import {
  CreateMarketingCampaignDto,
  UpdateMarketingCampaignDto,
} from './dto/marketing-campaign.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { Season } from '../seasons/entities/season.entity';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(MarketingCampaign)
    private readonly marketingCampaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  // --- Old Ad Campaigns ---

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const { businessId, startDate, endDate, ...campaignData } =
      createCampaignDto;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    const campaign = this.campaignRepository.create({
      ...campaignData,
      startDate,
      endDate,
      business,
    });
    return this.campaignRepository.save(campaign);
  }

  findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find({ relations: ['business'] });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['business'],
    });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaignToUpdate = await this.findOne(id);
    const { businessId, startDate, endDate, ...campaignData } =
      updateCampaignDto;

    Object.assign(campaignToUpdate, campaignData);

    if (startDate) {
      campaignToUpdate.startDate = new Date(startDate);
    }
    // Handle endDate update, including clearing it
    if (updateCampaignDto.hasOwnProperty('endDate')) {
      campaignToUpdate.endDate = endDate ? new Date(endDate) : null;
    }

    // Validation should only happen if endDate is not null
    if (
      campaignToUpdate.endDate &&
      campaignToUpdate.endDate <= campaignToUpdate.startDate
    ) {
      throw new BadRequestException('End date must be after start date');
    }

    if (businessId) {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });
      if (!business) {
        throw new NotFoundException(`Business with ID ${businessId} not found`);
      }
      campaignToUpdate.business = business;
    }

    return this.campaignRepository.save(campaignToUpdate);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepository.remove(campaign);
  }

  async findMine(userId: string): Promise<Campaign[]> {
    const businesses = await this.businessRepository.find({
      where: { user: { id: userId } },
    });
    if (businesses.length === 0) {
      return [];
    }
    const businessIds = businesses.map((business) => business.id);
    return this.campaignRepository.find({
      where: {
        business: {
          id: In(businessIds),
        },
      },
      relations: ['business'],
    });
  }

  // --- New Marketing Campaigns (Coupon System) ---

  async createMarketingCampaign(
    dto: CreateMarketingCampaignDto,
  ): Promise<MarketingCampaign> {
    const { seasonId, ...rest } = dto;
    let { startDate, endDate } = dto;
    let season: Season | null = null;

    if (seasonId) {
      season = await this.seasonRepository.findOne({ where: { id: seasonId } });
      if (!season) throw new NotFoundException('Season not found');
      startDate = season.startDate;
      endDate = season.endDate;
    }

    const campaign = this.marketingCampaignRepository.create({
      ...rest,
      startDate,
      endDate,
      season,
    });
    return this.marketingCampaignRepository.save(campaign);
  }

  async findAllMarketingCampaigns(
    pagination: PaginationQueryDto,
  ): Promise<PageDto<MarketingCampaign>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.marketingCampaignRepository.findAndCount({
      skip,
      take: limit,
      relations: ['season'],
      order: { created_at: 'DESC' },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination as any,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOneMarketingCampaign(id: string): Promise<MarketingCampaign> {
    const campaign = await this.marketingCampaignRepository.findOne({
      where: { id },
      relations: ['coupons', 'season'],
    });
    if (!campaign) throw new NotFoundException('Marketing Campaign not found');
    return campaign;
  }

  async updateMarketingCampaign(
    id: string,
    dto: UpdateMarketingCampaignDto,
  ): Promise<MarketingCampaign> {
    const campaign = await this.findOneMarketingCampaign(id);
    const { seasonId, startDate, endDate, ...rest } = dto;

    if (seasonId) {
      const season = await this.seasonRepository.findOne({
        where: { id: seasonId },
      });
      if (!season) throw new NotFoundException('Season not found');
      campaign.season = season;
      campaign.startDate = season.startDate;
      campaign.endDate = season.endDate;
    } else if (dto.hasOwnProperty('seasonId') && seasonId === null) {
      campaign.season = null;
    }

    if (!seasonId) {
      if (startDate) campaign.startDate = startDate;
      if (endDate) campaign.endDate = endDate;
    }

    Object.assign(campaign, rest);
    return this.marketingCampaignRepository.save(campaign);
  }

  async removeMarketingCampaign(id: string): Promise<void> {
    const campaign = await this.findOneMarketingCampaign(id);
    await this.marketingCampaignRepository.softRemove(campaign);
  }
}
