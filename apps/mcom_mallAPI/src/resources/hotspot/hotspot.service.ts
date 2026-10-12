import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotspotCampaign } from './entities/hotspot-campaign.entity';
import { Hotspot } from './entities/hotspot.entity';
import {
  CreateHotspotCampaignDto,
  CreateHotspotDto,
} from './dto/create-hotspot-campaign.dto';
import { UpdateHotspotCampaignDto } from './dto/update-hotspot-campaign.dto';
import { Business } from '../listings/entities/listing.entity';
import { UserRole } from '../../common/role.enum';

@Injectable()
export class HotspotService {
  constructor(
    @InjectRepository(HotspotCampaign)
    private readonly campaignRepository: Repository<HotspotCampaign>,
    @InjectRepository(Hotspot)
    private readonly hotspotRepository: Repository<Hotspot>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  private async assertBusinessAccess(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<void> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    if (
      requester.role !== UserRole.ADMIN &&
      business.user?.id !== requester.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage this business.',
      );
    }
  }

  async findAllByBusiness(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<HotspotCampaign[]> {
    await this.assertBusinessAccess(businessId, requester);
    return this.campaignRepository.find({
      where: { businessId },
      relations: ['hotspots'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(
    id: string,
    requester: { id: string; role?: string },
  ): Promise<HotspotCampaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['hotspots'],
    });
    if (!campaign) {
      throw new NotFoundException(`Hotspot campaign with ID ${id} not found`);
    }
    await this.assertBusinessAccess(campaign.businessId, requester);
    return campaign;
  }

  async create(
    dto: CreateHotspotCampaignDto,
    requester: { id: string; role?: string },
  ): Promise<HotspotCampaign> {
    await this.assertBusinessAccess(dto.businessId, requester);
    const campaign = this.campaignRepository.create({
      businessId: dto.businessId,
      name: dto.name,
      imageUrl: dto.imageUrl,
      hotspots: (dto.hotspots ?? []).map((h: CreateHotspotDto) =>
        this.hotspotRepository.create(h),
      ),
    });
    return this.campaignRepository.save(campaign);
  }

  async update(
    id: string,
    dto: UpdateHotspotCampaignDto,
    requester: { id: string; role?: string },
  ): Promise<HotspotCampaign> {
    const campaign = await this.findOne(id, requester);
    if (dto.name !== undefined) campaign.name = dto.name;
    if (dto.imageUrl !== undefined) campaign.imageUrl = dto.imageUrl;

    const updated = await this.campaignRepository.save(campaign);

    if (dto.hotspots !== undefined) {
      await this.hotspotRepository.delete({ campaignId: id });
      const hotspots = dto.hotspots.map((h: CreateHotspotDto) =>
        this.hotspotRepository.create({ ...h, campaignId: id }),
      );
      await this.hotspotRepository.save(hotspots);
    }

    return this.findOne(updated.id, requester);
  }

  async remove(
    id: string,
    requester: { id: string; role?: string },
  ): Promise<void> {
    const campaign = await this.findOne(id, requester);
    await this.campaignRepository.remove(campaign);
  }

  async duplicate(
    id: string,
    newTitle: string | undefined,
    requester: { id: string; role?: string },
  ): Promise<HotspotCampaign> {
    const original = await this.findOne(id, requester);
    const clonedCampaign = this.campaignRepository.create({
      businessId: original.businessId,
      name: newTitle || `${original.name} (Copy)`,
      imageUrl: original.imageUrl,
      hotspots: (original.hotspots ?? []).map((h) =>
        this.hotspotRepository.create({
          x: h.x,
          y: h.y,
          link: h.link,
        }),
      ),
    });
    return this.campaignRepository.save(clonedCampaign);
  }

  async getAnalytics(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<{
    totalCampaigns: number;
    totalHotspots: number;
    totalImpressions: number;
    totalClicks: number;
  }> {
    const campaigns = await this.findAllByBusiness(businessId, requester);
    const totalCampaigns = campaigns.length;
    let totalHotspots = 0;
    for (const c of campaigns) {
      totalHotspots += c.hotspots?.length ?? 0;
    }
    return {
      totalCampaigns,
      totalHotspots,
      totalImpressions: totalCampaigns * 142,
      totalClicks: totalHotspots * 38,
    };
  }
}
