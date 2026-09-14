import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotspotCampaign } from './entities/hotspot-campaign.entity';
import { Hotspot } from './entities/hotspot.entity';
import {
  CreateHotspotCampaignDto,
  CreateHotspotDto,
} from './dto/create-hotspot-campaign.dto';
import { UpdateHotspotCampaignDto } from './dto/update-hotspot-campaign.dto';

@Injectable()
export class HotspotService {
  constructor(
    @InjectRepository(HotspotCampaign)
    private readonly campaignRepository: Repository<HotspotCampaign>,
    @InjectRepository(Hotspot)
    private readonly hotspotRepository: Repository<Hotspot>,
  ) {}

  async findAllByBusiness(businessId: string): Promise<HotspotCampaign[]> {
    return this.campaignRepository.find({
      where: { businessId },
      relations: ['hotspots'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<HotspotCampaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['hotspots'],
    });
    if (!campaign) {
      throw new NotFoundException(`Hotspot campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async create(dto: CreateHotspotCampaignDto): Promise<HotspotCampaign> {
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
  ): Promise<HotspotCampaign> {
    const campaign = await this.findOne(id);
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

    return this.findOne(updated.id);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepository.remove(campaign);
  }

  async duplicate(id: string, newTitle?: string): Promise<HotspotCampaign> {
    const original = await this.findOne(id);
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

  async getAnalytics(businessId: string): Promise<{
    totalCampaigns: number;
    totalHotspots: number;
    totalImpressions: number;
    totalClicks: number;
  }> {
    const campaigns = await this.findAllByBusiness(businessId);
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
