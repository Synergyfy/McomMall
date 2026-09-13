import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerUserDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 1250 })
  points: number;
}

export class PointsBreakdownDto {
  @ApiProperty({ example: 3240 })
  earned: number;

  @ApiProperty({ example: 1500 })
  used: number;

  @ApiProperty({ example: 100 })
  pending: number;
}

export class TrendingBusinessDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Brew & Co.' })
  businessName: string;

  @ApiProperty({ example: 'Coffee' })
  category: string;

  @ApiProperty({ example: 4.8 })
  rating: number;

  @ApiProperty({ example: 840 })
  reviewCount: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.png' })
  bannerUrl?: string;

  @ApiProperty({ example: 'Specialty coffee roaster' })
  shortDescription: string;

  @ApiPropertyOptional({ example: '0.2 miles', nullable: true })
  distance?: string | null;

  @ApiPropertyOptional({ example: 'Trending' })
  tag?: string;
}

export class RecentActivityReviewDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  author: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Great coffee!' })
  comment: string;
}

export class RecentActivityDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  businessId: string;

  @ApiProperty({ example: 'Brew & Co.' })
  businessName: string;

  @ApiProperty({ type: [RecentActivityReviewDto] })
  reviews: RecentActivityReviewDto[];
}

export class NearbyDealDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Buy 1 Get 1 Free Coffee' })
  name: string;

  @ApiProperty({ example: 'Grab a friend!' })
  description: string;

  @ApiProperty({ example: 50 })
  points: number;

  @ApiProperty({ example: ['Brew & Co.'] })
  businesses: string[];
}

export class CustomerHomeResponseDto {
  @ApiProperty({ type: CustomerUserDto })
  user: CustomerUserDto;

  @ApiProperty({ type: PointsBreakdownDto })
  pointsBreakdown: PointsBreakdownDto;

  @ApiProperty({ example: 12 })
  liveOffersCount: number;

  @ApiProperty({ example: 3 })
  activeCampaignsCount: number;

  @ApiProperty({ type: [TrendingBusinessDto] })
  trending: TrendingBusinessDto[];

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivity: RecentActivityDto[];

  @ApiProperty({ type: [NearbyDealDto] })
  nearbyDeals: NearbyDealDto[];
}

export class PromotionItemResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: '50% Off All Burgers' })
  title: string;

  @ApiProperty({ example: 'Grill House NYC' })
  businessName: string;

  @ApiProperty({ example: '50% OFF' })
  benefitValue: string;

  @ApiProperty({ example: 'Massive flash sale' })
  description: string;

  @ApiProperty({ example: 'Massive flash sale, today only.' })
  longDescription: string;

  @ApiPropertyOptional({ example: 'Manhattan', nullable: true })
  borough?: string | null;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.000Z', nullable: true })
  expiresAt?: Date | null;

  @ApiProperty({ example: 'Ends in 2h 15m' })
  expiryText: string;

  @ApiProperty({ example: 'flash' })
  promotionType: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/banner.png',
    nullable: true,
  })
  image?: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class RewardResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Artisan Coffee Duo' })
  title: string;

  @ApiProperty({ example: 'Grounded Cafe' })
  brand: string;

  @ApiProperty({ example: 'Available' })
  category: string;

  @ApiProperty({ example: 500 })
  cost: number;

  @ApiProperty({ example: 'Two free premium beverages' })
  description: string;

  @ApiProperty({ example: 'Long description...' })
  longDescription: string;

  @ApiProperty({ example: 'https://cdn.example.com/image.png' })
  image: string;

  @ApiProperty({ example: 'workspace_premium' })
  badgeIcon: string;

  @ApiProperty({ example: 'voucher' })
  rewardType: string;

  @ApiPropertyOptional({ example: 'Valid on any two beverages.' })
  usageCondition?: string;

  @ApiProperty({ example: false })
  isHot: boolean;

  @ApiProperty({ example: false })
  isLocked: boolean;

  @ApiProperty({ example: 500 })
  pointsRequired: number;

  @ApiPropertyOptional({ example: 'Gold', nullable: true })
  tier?: string | null;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.000Z', nullable: true })
  expiresAt?: Date | null;

  @ApiProperty({ example: 'Available' })
  expiryText: string;
}

export class RedeemedRewardDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  rewardId: string;

  @ApiProperty({ example: 'Artisan Coffee Duo' })
  title: string;

  @ApiProperty({ example: 'Grounded Cafe' })
  brand: string;

  @ApiProperty({ example: 500 })
  cost: number;

  @ApiProperty({ example: 'claimed' })
  status: string;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  redeemedAt: Date;

  @ApiPropertyOptional({ example: 'MCOM2024', nullable: true })
  issuedCode?: string | null;
}

export class ExpiringRewardDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Free Croissant' })
  title: string;

  @ApiProperty({ example: 'Artisan Bakery' })
  brand: string;

  @ApiProperty({ example: 100 })
  cost: number;

  @ApiProperty({ example: '2026-09-30T23:59:59.000Z' })
  expiresAt: Date;
}

export class CustomerRewardsResponseDto {
  @ApiProperty({ example: 1250 })
  pointsBalance: number;

  @ApiProperty({ type: PointsBreakdownDto })
  pointsBreakdown: PointsBreakdownDto;

  @ApiProperty({ type: [RewardResponseDto] })
  rewards: RewardResponseDto[];

  @ApiProperty({ type: [RedeemedRewardDto] })
  redeemed: RedeemedRewardDto[];

  @ApiProperty({ type: [ExpiringRewardDto] })
  expiring: ExpiringRewardDto[];
}

export class RedeemRewardResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  rewardId: string;

  @ApiProperty({ example: 'Artisan Coffee Duo' })
  title: string;

  @ApiProperty({ example: 500 })
  cost: number;

  @ApiPropertyOptional({ example: 'MCOM2024', nullable: true })
  issuedCode?: string | null;

  @ApiProperty({ example: 'Reward claimed successfully' })
  message: string;
}

export class RedeemCodeResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'MCOM2024' })
  code: string;

  @ApiProperty({ example: 500 })
  pointsAwarded: number;

  @ApiProperty({ example: 'Code redeemed! 500 points added to your balance' })
  message: string;
}

export class CustomerEventsResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Manhattan Street Food Expo' })
  title: string;

  @ApiProperty({ example: 'Gourmet dishes from the top vendors' })
  description: string;

  @ApiProperty({ example: '2026-09-12' })
  date: string;

  @ApiProperty({ example: '12:00 PM' })
  time: string;

  @ApiPropertyOptional({ example: '8:00 PM', nullable: true })
  endTime?: string | null;

  @ApiProperty({ example: 'Manhattan Central Court' })
  location: string;

  @ApiPropertyOptional({ example: 'Manhattan', nullable: true })
  borough?: string | null;

  @ApiProperty({ example: 'in-person' })
  category: string;

  @ApiProperty({ example: 100 })
  capacity: number;

  @ApiProperty({ example: 342 })
  attendees: number;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/image.png',
    nullable: true,
  })
  image?: string | null;

  @ApiPropertyOptional({ example: 'Grill House NYC', nullable: true })
  businessName?: string | null;

  @ApiProperty({ example: 'upcoming' })
  status: string;
}

export class RsvpEventResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  eventId: string;

  @ApiProperty({ example: 'RSVP recorded' })
  message: string;
}

export class GamifyStatusResponseDto {
  @ApiProperty({
    example: { available: true, streak: 0, lastPrize: null },
  })
  dailySpin: {
    available: boolean;
    streak: number;
    lastPrize: {
      prizeType: string;
      prizeValue?: number;
      pointsAwarded?: number;
    } | null;
  };

  @ApiProperty({
    example: { available: true, lastPrize: null },
  })
  scratchCard: {
    available: boolean;
    lastPrize: {
      prizeType: string;
      prizeValue?: number;
      prizeLabel?: string | null;
    } | null;
  };

  @ApiProperty({
    example: [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Shop & Earn Challenge',
        progress: 50,
        isCompleted: false,
      },
    ],
  })
  challenges: ChallengeProgressResponseDto[];
}

export class SpinResultDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'points' })
  prizeType: string;

  @ApiProperty({ example: 50 })
  prizeValue: number;

  @ApiProperty({ example: 50 })
  pointsAwarded: number;

  @ApiProperty({ example: 'You won 50 points!' })
  message: string;
}

export class ScratchResultDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'points' })
  prizeType: string;

  @ApiPropertyOptional({ example: 15, nullable: true })
  prizeValue?: number;

  @ApiPropertyOptional({ example: '15 bonus points', nullable: true })
  prizeLabel?: string;
}

export class ChallengeResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Shop & Earn Challenge' })
  title: string;

  @ApiProperty({ example: 'Spend $200 across 3 stores this week' })
  description: string;

  @ApiProperty({ example: 'shop' })
  challengeType: string;

  @ApiProperty({ example: 200 })
  target: number;

  @ApiProperty({ example: 1000 })
  rewardPoints: number;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  startDate: Date;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59.000Z', nullable: true })
  endDate?: Date | null;
}

export class ChallengeProgressResponseDto extends ChallengeResponseDto {
  @ApiProperty({ example: 50 })
  progress: number;

  @ApiProperty({ example: false })
  isCompleted: boolean;
}

export class UpdateChallengeProgressResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  challengeId: string;

  @ApiProperty({ example: 200 })
  progress: number;

  @ApiProperty({ example: 200 })
  target: number;

  @ApiProperty({ example: true })
  isCompleted: boolean;
}

export class DiscoverCampaignDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Brew & Co. Flash Deal' })
  title: string;

  @ApiPropertyOptional({ example: 'Manhattan', nullable: true })
  borough?: string | null;

  @ApiProperty({ example: 100 })
  budget: number;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  startDate: Date;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59.000Z', nullable: true })
  endDate?: Date | null;
}

export class DiscoverBusinessDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Brew & Co.' })
  businessName: string;

  @ApiProperty({ example: 'Coffee' })
  category: string;

  @ApiProperty({ example: 4.8 })
  rating: number;

  @ApiProperty({ example: 840 })
  reviewCount: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.png' })
  bannerUrl?: string;

  @ApiProperty({ example: 'Specialty coffee roaster' })
  shortDescription: string;

  @ApiPropertyOptional({ example: 'VERIFIED' })
  statusTag?: string;
}

export class DiscoverResponseDto {
  @ApiProperty({ type: [DiscoverBusinessDto] })
  trending: DiscoverBusinessDto[];

  @ApiProperty({ type: [DiscoverCampaignDto] })
  boroughCampaigns: DiscoverCampaignDto[];

  @ApiProperty({ type: [NearbyDealDto] })
  promotions: NearbyDealDto[];

  @ApiProperty({ type: [CustomerEventsResponseDto] })
  events: CustomerEventsResponseDto[];

  @ApiProperty({ type: [DiscoverBusinessDto] })
  businesses: DiscoverBusinessDto[];
}

export class BusinessProfileOfferDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Buy 1 Get 1 Free Coffee' })
  name: string;

  @ApiProperty({ example: 'Grab a friend!' })
  description: string;

  @ApiProperty({ example: 50 })
  points: number;
}

export class BusinessProfileEventDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Coffee Tasting Masterclass' })
  title: string;

  @ApiProperty({ example: '2026-09-12' })
  date: string;

  @ApiProperty({ example: '10:00 AM' })
  time: string;

  @ApiProperty({ example: 'Brew & Co.' })
  location: string;

  @ApiProperty({ example: 'upcoming' })
  status: string;
}

export class BusinessProfileReviewDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  author: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Great coffee!' })
  comment: string;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  createdAt: Date;
}

export class CustomerBusinessProfileResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'Brew & Co.' })
  businessName: string;

  @ApiProperty({ example: 'Specialty coffee roaster' })
  shortDescription: string;

  @ApiProperty({ example: 'About the business...' })
  about: string;

  @ApiProperty({ example: 'Coffee' })
  category: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/logo.png',
    nullable: true,
  })
  logoUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/banner.png',
    nullable: true,
  })
  bannerUrl?: string | null;

  @ApiProperty({ example: ['https://cdn.example.com/image.png'] })
  media: string[];

  @ApiProperty({ example: 4.8 })
  rating: number;

  @ApiProperty({ example: 840 })
  reviewCount: number;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: 'VERIFIED' })
  statusTag: string;

  @ApiProperty({ type: [BusinessProfileReviewDto] })
  reviews: BusinessProfileReviewDto[];

  @ApiProperty({ type: [BusinessProfileOfferDto] })
  offers: BusinessProfileOfferDto[];

  @ApiProperty({ type: [BusinessProfileEventDto] })
  events: BusinessProfileEventDto[];
}
