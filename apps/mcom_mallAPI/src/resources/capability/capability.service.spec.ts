import { ForbiddenException } from '@nestjs/common';
import { ActionType, CapabilityService } from './capability.service';

const FUTURE = new Date(Date.now() + 24 * 60 * 60 * 1000);

function config(overrides: Record<string, any> = {}) {
  return {
    quotas: {
      allowProductListing: true,
      allowServiceListing: true,
      maxProducts: 2,
      maxServices: 2,
      maxGiftCardTemplates: 1,
      maxCouponTemplates: 1,
      maxLoyaltyPrograms: 0,
      maxImagesPerListing: 3,
      featuredListingAllowance: 2,
      ...(overrides.quotas ?? {}),
    },
    featureFlags: {
      priorityInSearch: false,
      advancedAnalytics: false,
      dedicatedSupport: false,
      allowCustomBranding: false,
      allowGroupCreation: false,
      ...(overrides.featureFlags ?? {}),
    },
  };
}

describe('CapabilityService plan enforcement', () => {
  let service: CapabilityService;
  let membershipService: { findActiveWithTier: jest.Mock };
  let productService: {
    countForUser: jest.Mock;
    countFeaturedForUser: jest.Mock;
  };
  let servicesService: {
    countForUser: jest.Mock;
    countFeaturedForUser: jest.Mock;
  };
  let plansService: { resolveActivePrice: jest.Mock; findAll: jest.Mock };
  let planConfig: any;

  beforeEach(() => {
    planConfig = config();
    membershipService = {
      findActiveWithTier: jest.fn().mockResolvedValue({
        isActive: true,
        planVariantId: 'variant-1',
        expiresAt: FUTURE,
      }),
    };
    productService = {
      countForUser: jest.fn().mockResolvedValue(0),
      countFeaturedForUser: jest.fn().mockResolvedValue(0),
    };
    servicesService = {
      countForUser: jest.fn().mockResolvedValue(0),
      countFeaturedForUser: jest.fn().mockResolvedValue(0),
    };
    plansService = {
      resolveActivePrice: jest
        .fn()
        .mockResolvedValue({ variant: { configuration: planConfig } }),
      findAll: jest.fn().mockResolvedValue([]),
    };

    service = new CapabilityService(
      membershipService as any,
      productService as any,
      servicesService as any,
      {} as any,
      {} as any,
      {} as any,
      plansService as any,
    );
  });

  it('grants no plan capability when the user has no membership, grant or trial', async () => {
    membershipService.findActiveWithTier.mockResolvedValue(null);

    await expect(service.getEffectiveConfig('user-1')).resolves.toBeNull();
    await expect(
      service.checkPermission('user-1', ActionType.CREATE_PRODUCT, {
        currentCount: 0,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    // The old bug fell back to the first plan in the catalogue.
    expect(plansService.findAll).not.toHaveBeenCalled();
  });

  it('enforces the product quota', async () => {
    await expect(
      service.checkPermission('user-1', ActionType.CREATE_PRODUCT, {
        currentCount: 2,
      }),
    ).rejects.toThrow('reached your limit of 2 products');

    await expect(
      service.checkPermission('user-1', ActionType.CREATE_PRODUCT, {
        currentCount: 1,
      }),
    ).resolves.toBeUndefined();
  });

  it('enforces the service listing flag', async () => {
    planConfig = config({ quotas: { allowServiceListing: false } });
    plansService.resolveActivePrice.mockResolvedValue({
      variant: { configuration: planConfig },
    });

    await expect(
      service.checkPermission('user-1', ActionType.CREATE_SERVICE, {
        currentCount: 0,
      }),
    ).rejects.toThrow('does not allow service listings');
  });

  it('enforces images per listing, ignoring video URLs', async () => {
    await expect(
      service.assertListingImageLimit('user-1', [
        'a.jpg',
        'b.jpg',
        'c.jpg',
        'clip.mp4',
      ]),
    ).resolves.toBeUndefined();

    await expect(
      service.assertListingImageLimit('user-1', [
        'a.jpg',
        'b.jpg',
        'c.jpg',
        'd.jpg',
      ]),
    ).rejects.toThrow('up to 3 images per listing');
  });

  it('enforces featured listing allowance across products and services', async () => {
    productService.countFeaturedForUser.mockResolvedValue(1);
    servicesService.countFeaturedForUser.mockResolvedValue(1);

    await expect(
      service.assertFeaturedListingAllowed('user-1'),
    ).rejects.toThrow('allows 2 featured listings');

    servicesService.countFeaturedForUser.mockResolvedValue(0);
    await expect(
      service.assertFeaturedListingAllowed('user-1'),
    ).resolves.toBeUndefined();
  });

  it('rejects featured listings when the plan includes none', async () => {
    planConfig = config({ quotas: { featuredListingAllowance: 0 } });
    plansService.resolveActivePrice.mockResolvedValue({
      variant: { configuration: planConfig },
    });

    await expect(
      service.assertFeaturedListingAllowed('user-1'),
    ).rejects.toThrow('does not include featured listings');
  });

  it('enforces advanced analytics', async () => {
    await expect(
      service.checkPermission('user-1', ActionType.ACCESS_ADVANCED_ANALYTICS),
    ).rejects.toThrow('does not allow access to advanced analytics');

    planConfig = config({ featureFlags: { advancedAnalytics: true } });
    plansService.resolveActivePrice.mockResolvedValue({
      variant: { configuration: planConfig },
    });
    await expect(
      service.checkPermission('user-1', ActionType.ACCESS_ADVANCED_ANALYTICS),
    ).resolves.toBeUndefined();
  });

  it('enforces custom branding', async () => {
    await expect(
      service.checkPermission('user-1', ActionType.USE_CUSTOM_BRANDING),
    ).rejects.toThrow('does not allow custom branding');
  });
});
