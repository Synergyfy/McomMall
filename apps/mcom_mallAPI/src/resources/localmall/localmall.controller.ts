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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { LocalMall } from './entities/localmall.entity';
import { Business } from '../listings/entities/listing.entity';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';

@Controller('localmall')
export class LocalMallController {
  constructor(
    private readonly onboardingDeciderService: OnboardingDeciderService,
    @InjectRepository(LocalMall)
    private readonly localMallRepository: Repository<LocalMall>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
  ) {}

  @Public()
  @Post('onboarding/check-location')
  @HttpCode(HttpStatus.OK)
  async checkLocation(@Body('postcode') postcode: string) {
    return this.onboardingDeciderService.checkLocation(postcode);
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get('customer/feed')
  async getCustomerFeed(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('postcode') postcode?: string,
    @CurrentUser() user?: User,
  ) {
    let resolvedBorough = 'Southwark'; // Default fallback
    let userLat = parseFloat(lat);
    let userLon = parseFloat(lon);

    if (postcode) {
      try {
        const deciderResult =
          await this.onboardingDeciderService.checkLocation(postcode);
        if (deciderResult && deciderResult.resolvedArea) {
          resolvedBorough = deciderResult.resolvedArea;
          userLat = deciderResult.latitude;
          userLon = deciderResult.longitude;
        }
      } catch (err) {
        console.error('Error resolving postcode in feed:', err);
      }
    } else if (!isNaN(userLat) && !isNaN(userLon)) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLon}&format=json&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'McomMall-Customer/1.0 (contact@mcommall.com)',
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          const addr = data.address || {};
          const borough =
            addr.suburb ||
            addr.neighbourhood ||
            addr.city_district ||
            addr.town ||
            addr.city ||
            '';
          if (borough) {
            resolvedBorough = borough
              .replace(/London Borough of /i, '')
              .replace(/Borough of /i, '')
              .replace(/City of /i, '')
              .trim();
          }
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);
      }
    }

    const mallName = `${resolvedBorough} Local Mall`;

    // Fetch businesses in this local mall with their active offers and campaigns
    const mall = await this.localMallRepository.findOne({
      where: { name: mallName },
      relations: [
        'businesses',
        'businesses.location',
        'businesses.category',
        'businesses.offers',
        'businesses.campaigns',
      ],
    });

    const businesses = mall ? mall.businesses : [];

    const nearbyDeals = [];
    const activeCampaigns = [];
    if (mall && mall.businesses) {
      const now = new Date();
      for (const b of mall.businesses) {
        if (b.offers) {
          for (const offer of b.offers) {
            if (offer.isActive) {
              const daysLeft = offer.endDate
                ? Math.max(
                    0,
                    Math.ceil(
                      (new Date(offer.endDate).getTime() - now.getTime()) /
                        (1000 * 3600 * 24),
                    ),
                  )
                : 3;
              nearbyDeals.push({
                business: b.businessName,
                deal: offer.name,
                points: offer.points || 50,
                expires: `${daysLeft}d`,
              });
            }
          }
        }
        if (b.campaigns) {
          for (const camp of b.campaigns) {
            const isActive =
              new Date(camp.startDate) <= now &&
              (!camp.endDate || new Date(camp.endDate) >= now);
            if (isActive) {
              const daysLeft = camp.endDate
                ? Math.max(
                    0,
                    Math.ceil(
                      (new Date(camp.endDate).getTime() - now.getTime()) /
                        (1000 * 3600 * 24),
                    ),
                  )
                : 3;
              activeCampaigns.push({
                id: camp.id,
                title: `${b.businessName} - ${camp.type.replace(/_/g, ' ')}`,
                budget: camp.budget,
                expires: `${daysLeft}d`,
              });
            }
          }
        }
      }
    }

    // Count live active consumers in database (UserRole.CUSTOMER)
    const consumerCount = await this.businessRepository.manager.count(User, {
      where: { role: 'customer' as any },
    });

    let pointsBalance = 2400;
    let weeklyPointsEarned = 0;
    if (user && user.id) {
      const dbUser = await this.userRepository.findOne({
        where: { id: user.id },
      });
      if (dbUser) {
        pointsBalance = dbUser.points;
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyTransactionResult = await this.pointTransactionRepository
        .createQueryBuilder('pt')
        .select('SUM(pt.points)', 'total')
        .where('pt.userId = :userId', { userId: user.id })
        .andWhere('pt.points > 0') // only count earned points
        .andWhere('pt.created_at >= :oneWeekAgo', { oneWeekAgo })
        .getRawOne();

      weeklyPointsEarned = weeklyTransactionResult?.total
        ? parseInt(weeklyTransactionResult.total)
        : 0;
    }

    return {
      borough: resolvedBorough,
      mallName,
      mallId: mall ? mall.id : null,
      businesses: businesses.map((b) => ({
        id: b.id,
        businessName: b.businessName,
        shortDescription: b.shortDescription,
        logoUrl: b.logoUrl,
        category: b.category ? b.category.name : 'Store',
        address: b.location ? b.location.addressLine1 : '',
        isClaimed: b.isClaimed,
        isVerified: b.isVerified,
      })),
      pointsBalance,
      weeklyPointsEarned,
      consumerCount,
      activeCampaigns,
      nearbyDeals,
    };
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
