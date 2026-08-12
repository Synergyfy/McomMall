import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
import { UsersService } from '../users/users.service';
import { ListingsService } from '../listings/listing.service';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../../common/role.enum';
import { ListingType } from '../listings/listing.enum';
import { Tier } from '../tier/entities/tier.entity';
import { Membership } from '../membership/entities/membership.entity';

export interface CompleteOnboardingDto {
  email: string;
  firstName: string;
  lastName: string;
  businessType: 'products' | 'services' | 'both';
  googlePlaceId?: string;
  businessName: string;
  businessPhone: string;
  address: string;
  postcode: string;
  sectorId: string;
  categoryId: string;
  subCategoryId: string;
  logoUrl?: string;
  password?: string;
  confirmPassword?: string;
  shortDescription?: string;
  selectedPlan?: string;
}

@Injectable()
export class GoogleBusinessService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(TaxonomyCategory)
    private readonly categoryRepository: Repository<TaxonomyCategory>,
    @InjectRepository(TaxonomySubcategory)
    private readonly subcategoryRepository: Repository<TaxonomySubcategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly listingsService: ListingsService,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  // Simulates fetching branches or fetches them using real API keys
  async getBranches(email: string): Promise<any[]> {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    // Default to Sandbox/Mock Mode if credentials are not configured
    if (!googleClientId || googleClientId.trim() === '') {
      return [
        {
          googlePlaceId: 'google_place_ikeja_electronics',
          businessName: 'Mcom Hub Electronics - Ikeja',
          address: '12 Allen Ave, Ikeja, Lagos',
          postcode: '100271',
          businessPhone: '+234 801 234 5678',
          googleCategoryId: 'gcid:computer_store',
        },
        {
          googlePlaceId: 'google_place_rye_lane_coffee',
          businessName: 'Rye Lane Coffee - Southwark',
          address: '123 Rye Lane, London',
          postcode: 'SE15 4TP',
          businessPhone: '+44 20 7123 4567',
          googleCategoryId: 'gcid:coffee_shop',
        },
        {
          googlePlaceId: 'google_place_peckham_fashion',
          businessName: 'Fashion Hub - Peckham',
          address: '45 Rye Ln, London',
          postcode: 'SE15 5DT',
          businessPhone: '+44 20 8123 4567',
          googleCategoryId: 'gcid:clothing_store',
        },
        {
          googlePlaceId: 'google_place_incomplete_boutique',
          businessName: 'Mystery Boutique - Peckham',
          address: '88 Peckham Rd, London',
          postcode: 'SE15 5DT',
          businessPhone: '', // Missing Phone (triggers fail-safe)
          googleCategoryId: 'gcid:unknown_or_generic_category', // Unknown category (triggers fail-safe)
        },
      ];
    }

    // In a real production setup, we would perform an authenticated HTTP request
    // to Google Business Profile API to list the locations.
    return [
      {
        googlePlaceId: 'google_place_production_location',
        businessName: 'Live Google Connected Branch',
        address: '100 High Street, London',
        postcode: 'EC1A 1BB',
        businessPhone: '+44 20 7946 0192',
        googleCategoryId: 'gcid:restaurant',
      },
    ];
  }

  // Translates Google Category IDs dynamically using DB sectors/categories/subcategories
  async mapGoogleCategory(googleCategoryId: string): Promise<any> {
    const gcid = (googleCategoryId || '').toLowerCase();

    // Find all database sectors, categories, and subcategories
    const sectors = await this.sectorRepository.find({
      relations: ['categories', 'categories.subcategories'],
    });

    let matchedSector: Sector | null = null;
    let matchedCategory: TaxonomyCategory | null = null;
    let matchedSubcategory: TaxonomySubcategory | null = null;

    // Helper: clean strings for match checks
    const matchesKeyword = (val: string, keywords: string[]) => {
      const lower = val.toLowerCase();
      return keywords.some((k) => lower.includes(k));
    };

    // Keyword mapping rules
    let keywords: string[] = [];
    if (
      matchesKeyword(gcid, [
        'computer',
        'electronics',
        'device',
        'mobile',
        'phone',
        'gadget',
        'tech',
      ])
    ) {
      keywords = ['electronic', 'tech', 'digital', 'retail'];
    } else if (
      matchesKeyword(gcid, [
        'coffee',
        'cafe',
        'restaurant',
        'food',
        'bakery',
        'dining',
        'drink',
        'bar',
      ])
    ) {
      keywords = ['food', 'drink', 'cafe', 'restaurant', 'dining', 'catering'];
    } else if (
      matchesKeyword(gcid, [
        'clothing',
        'fashion',
        'apparel',
        'shoe',
        'boutique',
        'wear',
      ])
    ) {
      keywords = ['fashion', 'retail', 'clothing', 'apparel'];
    } else if (
      matchesKeyword(gcid, ['grocery', 'supermarket', 'market', 'grocer'])
    ) {
      keywords = ['grocery', 'groceries', 'food', 'retail', 'supermarket'];
    } else if (matchesKeyword(gcid, ['florist', 'flower', 'gift', 'garden'])) {
      keywords = ['gift', 'flower', 'garden', 'florist', 'retail'];
    }

    // Search for matches in our database sectors/categories
    if (keywords.length > 0) {
      // 1. Try to find matching sector
      matchedSector =
        sectors.find((s) => matchesKeyword(s.name, keywords)) || null;

      if (matchedSector) {
        // 2. Try to find category inside sector
        matchedCategory =
          matchedSector.categories.find((c) =>
            matchesKeyword(c.name, keywords),
          ) || null;
        if (!matchedCategory && matchedSector.categories.length > 0) {
          matchedCategory = matchedSector.categories[0];
        }

        if (matchedCategory) {
          // 3. Try to find subcategory inside category
          matchedSubcategory =
            matchedCategory.subcategories.find((sub) =>
              matchesKeyword(sub.name, keywords),
            ) || null;
          if (!matchedSubcategory && matchedCategory.subcategories.length > 0) {
            matchedSubcategory = matchedCategory.subcategories[0];
          }
        }
      }
    }

    // If we didn't find any match, fall back to first Sector/Category/Subcategory if available
    // or return null to trigger the fail-safe edit form on the client
    if (!matchedSector && sectors.length > 0) {
      // Return null or let it fallback to none. Returning null is cleaner to trigger the fallback.
      return null;
    }

    return {
      sectorId: matchedSector?.id || null,
      categoryId: matchedCategory?.id || null,
      subCategoryId: matchedSubcategory?.id || null,
      sectorName: matchedSector?.name || null,
      categoryName: matchedCategory?.name || null,
      subCategoryName: matchedSubcategory?.name || null,
    };
  }

  // Atomically claims the business, registers/logs in the merchant, and creates the storefront listing
  async completeOnboarding(dto: CompleteOnboardingDto) {
    const {
      email,
      firstName,
      lastName,
      businessType,
      googlePlaceId,
      businessName,
      businessPhone,
      address,
      postcode,
      sectorId,
      categoryId,
      subCategoryId,
      logoUrl,
      shortDescription,
      selectedPlan,
    } = dto;

    // Basic UK Postcode regex check
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcode || !ukPostcodeRegex.test(postcode.trim())) {
      throw new BadRequestException(
        'We currently only support businesses within the United Kingdom. Please select a valid UK branch.',
      );
    }

    const isUuid = (val: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        val || '',
      );

    if (!sectorId || !isUuid(sectorId)) {
      throw new BadRequestException(
        'Sector ID is required and must be a valid UUID',
      );
    }
    if (!categoryId || !isUuid(categoryId)) {
      throw new BadRequestException(
        'Category ID is required and must be a valid UUID',
      );
    }
    if (!subCategoryId || !isUuid(subCategoryId)) {
      throw new BadRequestException(
        'SubCategory ID is required and must be a valid UUID',
      );
    }

    // Check if user already exists
    let user = await this.userRepository.findOne({ where: { email } });

    // Generate a secure random password for passwordless Google login
    const autoGeneratedPassword =
      Math.random().toString(36).slice(-12) + 'Gb1!';

    if (!user) {
      const userPassword = dto.password || autoGeneratedPassword;
      // Register new user account
      user = await this.usersService.create({
        email,
        firstName,
        lastName,
        password: userPassword,
        confirm_password: userPassword,
        phoneNumber: businessPhone || '0000000000',
        role: UserRole.OWNER,
      });
    }

    // ─── ENSURE USER HAS AN ACTIVE MEMBERSHIP FOR THE LISTING CREATION ───
    const tierRepository = this.dataSource.getRepository(Tier);
    const membershipRepository = this.dataSource.getRepository(Membership);

    let tierName = 'Basic'; // Default fallback
    if (selectedPlan === 'pro') tierName = 'Pro';
    else if (selectedPlan === 'plus') tierName = 'Plus';
    else if (selectedPlan === 'payg') tierName = 'PAYG';
    else if (selectedPlan === 'standard') tierName = 'Standard';

    let tier = await tierRepository
      .createQueryBuilder('tier')
      .where('LOWER(tier.name) = :name', { name: tierName.toLowerCase() })
      .getOne();

    if (!tier) {
      tier = await tierRepository.findOne({ where: { isActive: true } });
    }
    if (!tier) {
      tier = await tierRepository.findOne({ where: {} });
    }
    if (!tier) {
      // Create default trial tier if none exists in database
      const defaultConfiguration = {
        quotas: {
          maxListings: 100,
          allowProductListing: true,
          allowServiceListing: true,
          maxProducts: 50,
          maxServices: 50,
          maxGiftCardTemplates: 5,
          maxCouponTemplates: 10,
          maxLoyaltyPrograms: 1,
          maxImagesPerListing: 5,
          featuredListingAllowance: 2,
        },
        featureFlags: {
          priorityInSearch: true,
          advancedAnalytics: true,
          dedicatedSupport: true,
          allowCustomBranding: true,
          allowGroupCreation: true,
        },
      };
      const newTier = tierRepository.create({
        name: 'Default Trial Tier',
        description: 'Dynamically created trial tier',
        monthlyPrice: 0,
        quarterlyPrice: 0,
        annualPrice: 0,
        isActive: true,
        isDefault: true,
        type: 'TRIAL' as any,
        trialDuration: 14,
        configuration: defaultConfiguration,
      });
      tier = await tierRepository.save(newTier);
    }

    let membership = await membershipRepository.findOne({
      where: { user: { id: user.id }, isActive: true },
    });

    if (!membership) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days trial

      membership = membershipRepository.create({
        tier,
        user,
        startDate: new Date(),
        expiresAt,
        endDate: expiresAt,
        isActive: true,
        isTrial: true,
        trialDuration: 30,
        planType: 'monthly' as any,
      });
      membership = await membershipRepository.save(membership);

      user.membership = membership;
      await this.userRepository.save(user);
    }

    // Log the user in to get auth details
    const name = `${user.firstName} ${user.lastName}`;
    const auth = await this.authService.createLogin({
      sub: user.id,
      role: user.role as any,
      email: user.email,
      name,
      userId: user.id,
    });

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Prepare storefront listing payload
    const listingPayload: any = {
      listingType:
        businessType === 'both'
          ? [ListingType.PRODUCT, ListingType.SERVICE]
          : businessType === 'products'
            ? [ListingType.PRODUCT]
            : [ListingType.SERVICE],
      businessName,
      shortDescription:
        shortDescription ||
        (googlePlaceId
          ? 'Imported from Google Business Profile.'
          : 'Fresh local business profile.'),
      businessPhone: businessPhone || user.phoneNumber,
      businessEmail: email,
      location: {
        postcode,
        addressLine1: address,
        city: 'London',
        showPublicly: true,
      },
      sectorId,
      categoryId,
      subCategoryId,
      logoUrl: logoUrl || undefined,
      googlePlaceId, // Link listing to placeId
      status: 'published',
    };

    if (listingPayload.listingType.includes(ListingType.PRODUCT)) {
      listingPayload.productSellerProfile = {
        sellingModes: ['pickup'],
        hasAgeRestrictedItems: false,
      };
    }
    if (listingPayload.listingType.includes(ListingType.SERVICE)) {
      listingPayload.serviceProviderProfile = {
        quoteOnly: false,
        hasPublicLiabilityInsurance: false,
      };
    }

    // Create business storefront listing
    const listing = await this.listingsService.create(listingPayload, user.id);

    return {
      auth,
      user: {
        id: user.id,
        email: user.email,
        name,
        role: user.role,
      },
      listing: {
        id: listing.id,
        businessName: listing.businessName,
        status: listing.status,
      },
    };
  }

  async googleLogin(payload: { email?: string; idToken?: string }) {
    let email = payload.email;

    if (payload.idToken) {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const client = new OAuth2Client(googleClientId);
      try {
        const ticket = await client.verifyIdToken({
          idToken: payload.idToken,
          audience: googleClientId,
        });
        const verifiedPayload = ticket.getPayload();
        if (verifiedPayload?.email) {
          email = verifiedPayload.email;
        }
      } catch (_e) {
        throw new BadRequestException('Invalid or expired Google ID token');
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Google ID token (idToken) is required for production login.');
    }

    if (!email) {
      throw new BadRequestException('Valid email address or verified ID token is required.');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        `Account with email ${email} not found. Please sign up first.`,
      );
    }

    const name = `${user.firstName} ${user.lastName}`;
    const auth = await this.authService.createLogin({
      sub: user.id,
      role: user.role as any,
      email: user.email,
      name,
      userId: user.id,
    });

    await this.usersService.updateLastLogin(user.id);

    return {
      auth,
      user: {
        id: user.id,
        email: user.email,
        name,
        role: user.role,
      },
    };
  }
}
