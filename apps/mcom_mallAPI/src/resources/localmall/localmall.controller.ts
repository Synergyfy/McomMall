import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OnboardingDeciderService } from './onboarding-decider.service';
import { LocalMallFeedService } from './localmall-feed.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('localmall')
export class LocalMallController {
  constructor(
    private readonly onboardingDeciderService: OnboardingDeciderService,
    private readonly localMallFeedService: LocalMallFeedService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  @Public()
  @Post('onboarding/check-location')
  @HttpCode(HttpStatus.OK)
  async checkLocation(@Body('postcode') postcode: string) {
    return this.onboardingDeciderService.checkLocation(postcode);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('customer/feed')
  async getCustomerFeed(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('postcode') postcode?: string,
    @CurrentUser() user?: User,
  ) {
    return this.localMallFeedService.getCustomerFeed({
      user,
      postcode,
      lat,
      lon,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('business/partnerships')
  async getPartnerships(@CurrentUser() user: User) {
    // 1. Fetch user's business with category relationship
    const business = await this.businessRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['localMall', 'category'],
    });

    if (!business) {
      return [];
    }

    // 2. Fetch other businesses in the same local mall
    const otherBusinesses = await this.businessRepository.find({
      where: {
        localMallId: business.localMallId,
        id: Not(business.id),
      },
      relations: ['category'],
    });

    // 3. Compute partnerships based on category mapping
    const currentCategoryName = business.category ? business.category.name : '';

    // Categorise business types based on category name or business name keywords
    const getCategoryType = (catName: string, bizName: string) => {
      const name = (catName || bizName || '').toLowerCase();
      if (
        name.includes('laptop') ||
        name.includes('computer') ||
        name.includes('pc') ||
        name.includes('tech') ||
        name.includes('phone') ||
        name.includes('mobile') ||
        name.includes('electronic') ||
        name.includes('gadget') ||
        name.includes('software') ||
        name.includes('it ') ||
        name.includes('system')
      ) {
        return 'tech';
      }
      if (
        name.includes('bakery') ||
        name.includes('bread') ||
        name.includes('cake') ||
        name.includes('coffee') ||
        name.includes('cafe') ||
        name.includes('deli') ||
        name.includes('food') ||
        name.includes('restaurant') ||
        name.includes('bistro') ||
        name.includes('kitchen') ||
        name.includes('wine') ||
        name.includes('bar') ||
        name.includes('diner') ||
        name.includes('sweet')
      ) {
        return 'food';
      }
      if (
        name.includes('clothing') ||
        name.includes('boutique') ||
        name.includes('fashion') ||
        name.includes('apparel') ||
        name.includes('shoes') ||
        name.includes('wear') ||
        name.includes('tailor') ||
        name.includes('style')
      ) {
        return 'fashion';
      }
      if (
        name.includes('salon') ||
        name.includes('barber') ||
        name.includes('hair') ||
        name.includes('spa') ||
        name.includes('beauty') ||
        name.includes('wellness') ||
        name.includes('nails') ||
        name.includes('yoga') ||
        name.includes('gym') ||
        name.includes('fitness') ||
        name.includes('therapy')
      ) {
        return 'wellness';
      }
      return 'general';
    };

    const currentType = getCategoryType(
      currentCategoryName,
      business.businessName,
    );

    if (otherBusinesses.length === 0) {
      // Fallback sector-specific templates
      switch (currentType) {
        case 'tech':
          return [
            {
              pct: 96,
              name: `${business.businessName} × Local Tech Support`,
              description: 'Tech Synergy',
            },
            {
              pct: 92,
              name: `${business.businessName} × Co-working Spaces`,
              description: 'Co-working Hub',
            },
          ];
        case 'food':
          return [
            {
              pct: 96,
              name: `${business.businessName} × Local Bakery`,
              description: 'Menu Collaboration',
            },
            {
              pct: 92,
              name: `Community Garden × ${business.businessName}`,
              description: 'Organic Supply',
            },
          ];
        case 'fashion':
          return [
            {
              pct: 96,
              name: `${business.businessName} × Local Tailor & Repairs`,
              description: 'Complementary Fit',
            },
            {
              pct: 92,
              name: `${business.businessName} × Artisan Jewellery`,
              description: 'Accessory Bundle',
            },
          ];
        case 'wellness':
          return [
            {
              pct: 96,
              name: `${business.businessName} × Organic Skincare Shop`,
              description: 'Product Synergy',
            },
            {
              pct: 92,
              name: `Local Yoga Studio × ${business.businessName}`,
              description: 'Wellness Bundle',
            },
          ];
        default:
          return [
            {
              pct: 96,
              name: `${business.businessName} × Local Bakery`,
              description: 'Menu Collaboration',
            },
            {
              pct: 92,
              name: `Community Garden × ${business.businessName}`,
              description: 'Supply Logistics',
            },
          ];
      }
    }

    // Match with other actual businesses in the mall
    return otherBusinesses
      .map((b) => {
        const otherCategoryName = b.category ? b.category.name : '';
        const otherType = getCategoryType(otherCategoryName, b.businessName);

        let pct = 70;
        let description = 'Ecosystem Member';

        if (currentType === otherType && currentType !== 'general') {
          pct = 96;
          description = 'Direct Sector Synergy';
        } else if (
          (currentType === 'tech' && otherType === 'general') ||
          (currentType === 'food' && otherType === 'general')
        ) {
          pct = 84;
          description = 'Ecosystem Supplier';
        } else if (
          currentType === 'food' &&
          b.businessName.toLowerCase().includes('garden')
        ) {
          pct = 92;
          description = 'Farm-to-Table Supply';
        } else if (currentType === 'tech' && otherType === 'food') {
          pct = 76;
          description = 'Remote Work Promo';
        } else if (currentType === 'food' && otherType === 'tech') {
          pct = 76;
          description = 'Smart POS Partner';
        } else {
          pct = 54;
          description = 'Local Foot Traffic';
        }

        return {
          pct,
          name: `${business.businessName} × ${b.businessName}`,
          description,
        };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 2);
  }
}
