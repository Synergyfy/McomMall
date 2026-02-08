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

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

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
}
