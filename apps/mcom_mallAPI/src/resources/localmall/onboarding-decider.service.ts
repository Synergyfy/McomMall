import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivatedRegion } from './entities/activated-region.entity';
import { LocalMall } from './entities/localmall.entity';
import { Business } from '../listings/entities/listing.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OnboardingDeciderService {
  constructor(
    @InjectRepository(ActivatedRegion)
    private readonly activatedRegionRepository: Repository<ActivatedRegion>,
    @InjectRepository(LocalMall)
    private readonly localMallRepository: Repository<LocalMall>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async checkLocation(postcode: string): Promise<any> {
    if (!postcode) {
      throw new BadRequestException('Postcode is required');
    }
    const cleanPostcode = postcode.trim().toUpperCase();

    // Basic UK Postcode regex check
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!ukPostcodeRegex.test(cleanPostcode)) {
      return {
        postcode: cleanPostcode,
        status: 'inactive',
        message: 'We currently only support businesses within the United Kingdom. Please enter a valid UK postcode.',
        options: {
          allowWaitlist: false,
          allowDigitalOnly: false,
          emergingZone: false,
        },
      };
    }

    // 1. Resolve coordinates & borough dynamically using Nominatim
    let lat = 0;
    let lon = 0;
    let borough = '';

    try {
      const postcodeResponse = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode.replace(/\s+/g, ''))}`
      );
      if (postcodeResponse.ok) {
        const body = await postcodeResponse.json();
        if (body && body.status === 200 && body.result) {
          lat = body.result.latitude;
          lon = body.result.longitude;
          const rawBorough = body.result.admin_district || body.result.region || '';
          borough = rawBorough
            .replace(/London Borough of /i, '')
            .replace(/Borough of /i, '')
            .replace(/City of /i, '')
            .replace(/Royal Borough of /i, '')
            .trim();
        }
      }
    } catch (err) {
      console.error('Postcodes.io lookup error:', err);
    }

    // Fallback to Nominatim if Postcodes.io lookup failed or was unable to resolve a borough
    if (!borough) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanPostcode)}&format=json&addressdetails=1&limit=1&countrycodes=gb`,
          {
            headers: {
              'User-Agent': 'McomMall-Onboarding/1.0 (contact@mcommall.com)',
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat);
            lon = parseFloat(data[0].lon);
            const addr = data[0].address || {};
            const rawBorough =
              addr.city_district ||
              addr.county ||
              addr.town ||
              addr.city ||
              addr.suburb ||
              addr.neighbourhood ||
              '';
            borough = rawBorough
              .replace(/London Borough of /i, '')
              .replace(/Borough of /i, '')
              .replace(/City of /i, '')
              .replace(/Royal Borough of /i, '')
              .trim();
          }
        }
      } catch (err) {
        console.error('Nominatim lookup error:', err);
      }
    }

    if (!borough || isNaN(lat) || isNaN(lon)) {
      // Fallback for general unrecognized postcode: Option B Waitlist
      return {
        postcode: cleanPostcode,
        status: 'inactive',
        message: 'Your area is not fully activated yet.',
        options: {
          allowWaitlist: true,
          allowDigitalOnly: true,
          emergingZone: false,
        },
      };
    }

    // 2. Find or create the local mall for this borough
    const mallName = `${borough} Local Mall`;
    let localMall = await this.localMallRepository.findOne({
      where: { name: mallName },
    });

    if (!localMall) {
      localMall = this.localMallRepository.create({
        name: mallName,
        latitude: lat,
        longitude: lon,
      });
      await this.localMallRepository.save(localMall);
    }

    // 3. Count how many businesses are in this mall
    const businessCount = await this.businessRepository.count({
      where: { localMallId: localMall.id },
    });

    const activeCampaignsCount = await this.businessRepository.manager
      .createQueryBuilder(Campaign, 'campaign')
      .innerJoin('campaign.business', 'business')
      .where('business.localMallId = :localMallId', { localMallId: localMall.id })
      .andWhere('campaign.startDate <= :now', { now: new Date() })
      .andWhere('(campaign.endDate IS NULL OR campaign.endDate >= :now)', { now: new Date() })
      .getCount();

    const consumerCount = await this.businessRepository.manager.count(User, {
      where: { role: 'customer' as any },
    });

    // 4. Find or create the ActivatedRegion record
    let activeRegion = await this.activatedRegionRepository.findOne({
      where: { name: borough },
    });

    const shouldBeActive = businessCount >= 1; // It becomes active if there is at least one existing business (so with the new registrant, it will be >= 2)

    if (!activeRegion) {
      activeRegion = this.activatedRegionRepository.create({
        name: borough,
        isActive: shouldBeActive,
      });
      try {
        await this.activatedRegionRepository.save(activeRegion);
      } catch (err) {
        // Handle race condition if unique constraint fails
        activeRegion = await this.activatedRegionRepository.findOne({
          where: { name: borough },
        });
      }
    } else if (activeRegion.isActive !== shouldBeActive) {
      activeRegion.isActive = shouldBeActive;
      await this.activatedRegionRepository.save(activeRegion);
    }

    if (!activeRegion.isActive) {
      // Region not active (0 or 1 business currently)
      return {
        postcode: cleanPostcode,
        resolvedArea: borough,
        latitude: lat,
        longitude: lon,
        status: 'inactive',
        localMallId: localMall.id,
        localMallName: localMall.name,
        businessCount,
        activeCampaignsCount,
        consumerCount,
        message: `${borough} is not fully activated yet.`,
        options: {
          allowWaitlist: true,
          allowDigitalOnly: true,
          emergingZone: true,
        },
      };
    }

    return {
      postcode: cleanPostcode,
      resolvedArea: borough,
      latitude: lat,
      longitude: lon,
      status: 'active',
      localMallId: localMall.id,
      localMallName: localMall.name,
      businessCount,
      activeCampaignsCount,
      consumerCount,
      message: `You are joining: ${localMall.name}`,
    };
  }
}
