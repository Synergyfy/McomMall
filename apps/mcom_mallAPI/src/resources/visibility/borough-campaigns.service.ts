import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoroughCampaign } from './entities/borough-campaign.entity';
import { BoroughParticipation } from './entities/borough-participation.entity';

@Injectable()
export class BoroughCampaignsService {
  constructor(
    @InjectRepository(BoroughCampaign)
    private readonly campaignRepository: Repository<BoroughCampaign>,
    @InjectRepository(BoroughParticipation)
    private readonly participationRepository: Repository<BoroughParticipation>,
  ) {}

  async findAll(): Promise<BoroughCampaign[]> {
    const campaigns = await this.campaignRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Seed initial mock campaigns if none exist in the database
    if (campaigns.length === 0) {
      const seeds = [
        this.campaignRepository.create({
          name: 'Central District Summer Social',
          description:
            'Promote local neighborhood events, artisan markets, and sidewalk dining to tourists and residents.',
          targetAudience: 'Local Residents & Tourists',
          reach: 8200,
          impressions: 12400,
          daysLeft: 14,
          merchantCount: 42,
          progress: 65,
          bannerUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBhCX4q_QtOcJE9OhP8NikB8njUB8W6VPnBu0tR_cD6ceiXFXtQgZaOvEAK21dkVS-04Nq2pxgYOou_xcyZxiiPjJbTQCwl0KDdI78ZWRuPAyEkldzXMRM5kNsxDy9_Hdu_pesrizsdxOHyAeecqEqPxt_kdvQ2pEwR4VTZWmQ4V6vlU6QVNDw9mjHXAHgwTEwDIWKxqXOSS1lURyyCNsa1GtLhAjMy9Lfv8L-E1_0IxuSrt0obJu3wFrdqR_TV9N4rz8zFADMw1y4',
        }),
        this.campaignRepository.create({
          name: 'Northside Artisan Expo',
          description:
            'Showcase premium handmade products, custom crafts, and specialized artwork collections.',
          targetAudience: 'High-value Collectors',
          reach: 8200,
          impressions: 8200,
          daysLeft: 28,
          merchantCount: 18,
          progress: 30,
          bannerUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCgiZMhYAPxYysMj7zYs6KfNxeuHMOBgKakKwXQdLP8POF5g9jIqFnul82NF7v3IHPEODPdbrDfnGAh3hfjmIGZVCZuJIsWp1oeFRMJ1D_XfTpFHAdIhdOad32bsX6Fd5O1dXlH6hPZ-EW1L_ACv_oPiHwKLq4FMSofU4qHVP52YxatI6suA2WFIQtZqMbE6OO-ItKhYInI519pamNLbmteiabkVgDlRp0ySCqO3QtimmzFYus4dxuXCEVPE6Z4KbrxvLILZnbYo8c',
        }),
      ];
      await this.campaignRepository.save(seeds);
      return this.campaignRepository.find({ order: { createdAt: 'DESC' } });
    }

    return campaigns;
  }

  async participate(
    campaignId: string,
    businessId: string,
  ): Promise<BoroughParticipation> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new NotFoundException(
        `Borough campaign with ID ${campaignId} not found`,
      );
    }

    // Check if already participating
    let participation = await this.participationRepository.findOne({
      where: { campaignId, businessId },
    });

    if (!participation) {
      participation = this.participationRepository.create({
        campaignId,
        businessId,
      });
      await this.participationRepository.save(participation);

      // Increment campaign merchant count
      campaign.merchantCount += 1;
      await this.campaignRepository.save(campaign);
    }

    return participation;
  }
}
