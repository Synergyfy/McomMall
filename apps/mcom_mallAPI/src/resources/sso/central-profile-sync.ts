import { Logger } from '@nestjs/common';
import { DataSource, ILike, Repository } from 'typeorm';
import { UserRole } from '../../common/role.enum';
import { BusinessStatus, ListingType } from '../listings/listing.enum';
import { Business } from '../listings/entities/listing.entity';
import { Location } from '../listings/entities/location.entity';
import { SocialLink } from '../listings/entities/social_link.entity';
import { LocalMall } from '../localmall/entities/localmall.entity';
import { ActivatedRegion } from '../localmall/entities/activated-region.entity';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
import { User } from '../users/entities/user.entity';

/**
 * Canonical MCOM Central identity payload (protocol 2026-10-01).
 *
 * The same shape is returned by the SSO token exchange, `/auth/sso/userinfo`
 * and `/auth/sso/entitlement`, so this normaliser is the single place where
 * Central's field names are mapped onto the mall's local schema.
 */
export interface NormalizedBusinessProfile {
  centralBusinessId: string | null;
  businessName: string | null;
  businessType: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  postcode: string | null;
  country: string | null;
  industry: string | null;
  category: string | null;
  subCategory: string | null;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  openingHours: string | null;
  socialMedia: unknown;
  isOnGoogle: boolean | null;
  raw: Record<string, unknown>;
}

export interface NormalizedCentralUser {
  centralUserId: string | null;
  email: string | null;
  role: string;
  profileType: string;
  isAffiliate: boolean;
  /** True when Central supplied explicit person-name claims. */
  hasExplicitName: boolean;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  displayName: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
  phone: string | null;
  address: string | null;
  postcode: string | null;
  country: string | null;
  business: NormalizedBusinessProfile | null;
  customerProfile: Record<string, unknown> | null;
  raw: Record<string, unknown>;
}

const COUNTRY_CODES: Record<string, string> = {
  'united kingdom': 'GB',
  'great britain': 'GB',
  uk: 'GB',
  gb: 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  'northern ireland': 'GB',
  ireland: 'IE',
  'united states': 'US',
  usa: 'US',
  'united states of america': 'US',
  canada: 'CA',
  australia: 'AU',
  nigeria: 'NG',
  ghana: 'GH',
  'south africa': 'ZA',
};

function clean(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function firstNonEmpty(...values: unknown[]): string | null {
  for (const value of values) {
    const cleaned = clean(value);
    if (cleaned) return cleaned;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function splitName(value: string | null): {
  firstName: string | null;
  lastName: string | null;
} {
  if (!value) return { firstName: null, lastName: null };
  const parts = value.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(' ') || null,
  };
}

function normaliseSocialMedia(value: unknown): unknown {
  if (typeof value !== 'string') return value ?? null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

export function normalizeCentralUser(centralUser: any): NormalizedCentralUser {
  const raw = asRecord(centralUser) ?? {};
  const businessProfile = asRecord(raw.businessProfile);
  const customerProfile = asRecord(raw.customerProfile);

  const role = (clean(raw.role) || 'CUSTOMER').toLowerCase();
  const profileType = clean(raw.profileType) || clean(raw.role) || 'CUSTOMER';
  const isBusiness =
    role === 'business' ||
    role === 'owner' ||
    profileType.toLowerCase() === 'business';

  const hasExplicitNameClaim =
    Object.prototype.hasOwnProperty.call(raw, 'firstName') ||
    Object.prototype.hasOwnProperty.call(raw, 'lastName');

  let firstName = clean(raw.firstName);
  let lastName = clean(raw.lastName);
  let hasExplicitName = hasExplicitNameClaim && Boolean(firstName || lastName);

  if (!hasExplicitName) {
    const fullName = clean(raw.fullName);
    if (fullName) {
      const split = splitName(fullName);
      firstName = split.firstName;
      lastName = split.lastName;
      hasExplicitName = true;
    }
  }

  if (hasExplicitName && (!firstName || !lastName)) {
    const split = splitName(clean(raw.fullName));
    firstName = firstName ?? split.firstName;
    lastName = lastName ?? split.lastName;
  }

  const fullName = hasExplicitName
    ? [firstName, lastName].filter(Boolean).join(' ') || null
    : null;

  const businessName = firstNonEmpty(
    businessProfile?.businessName,
    raw.businessName,
    isBusiness ? raw.name : null,
  );

  const businessPhone = firstNonEmpty(
    businessProfile?.phone,
    isBusiness ? raw.phone : null,
  );

  const businessAddress = firstNonEmpty(businessProfile?.address, raw.address);

  const businessPostcode = firstNonEmpty(
    businessProfile?.postcode,
    raw.postcode,
  );

  const businessCountry = firstNonEmpty(businessProfile?.country, raw.country);

  const businessLogo = firstNonEmpty(businessProfile?.logoUrl, raw.avatarUrl);

  const business: NormalizedBusinessProfile | null =
    isBusiness || businessProfile || businessName
      ? {
          centralBusinessId: firstNonEmpty(businessProfile?.id, raw.businessId),
          businessName,
          businessType: clean(businessProfile?.businessType),
          phone: businessPhone,
          email: firstNonEmpty(businessProfile?.email, raw.email),
          address: businessAddress,
          postcode: businessPostcode,
          country: businessCountry,
          industry: clean(businessProfile?.industry),
          category: clean(businessProfile?.category),
          subCategory: clean(businessProfile?.subCategory),
          description: clean(businessProfile?.description),
          website: clean(businessProfile?.website),
          logoUrl: businessLogo,
          openingHours: clean(businessProfile?.openingHours),
          socialMedia: normaliseSocialMedia(businessProfile?.socialMedia),
          isOnGoogle:
            typeof businessProfile?.isOnGoogle === 'boolean'
              ? businessProfile.isOnGoogle
              : null,
          raw: businessProfile ?? {},
        }
      : null;

  const phone = firstNonEmpty(
    raw.phone,
    business?.phone,
    customerProfile?.phone,
    asRecord(raw.agentProfile)?.phone,
    asRecord(raw.consultantProfile)?.phone,
    asRecord(raw.accountManagerProfile)?.phone,
  );

  return {
    centralUserId: firstNonEmpty(raw.sub, raw.id),
    email: clean(raw.email),
    role,
    profileType,
    isAffiliate: Boolean(raw.isAffiliate),
    hasExplicitName,
    firstName,
    lastName,
    fullName,
    displayName: clean(raw.name),
    jobTitle: clean(raw.jobTitle),
    avatarUrl: firstNonEmpty(raw.avatarUrl, business?.logoUrl),
    phone,
    address: firstNonEmpty(raw.address, business?.address),
    postcode: firstNonEmpty(raw.postcode, business?.postcode),
    country: firstNonEmpty(raw.country, business?.country),
    business,
    customerProfile,
    raw,
  };
}

export function resolveLocalRole(centralUser: any): UserRole {
  const profile = normalizeCentralUser(centralUser);
  return profile.role === 'business' ||
    profile.role === 'owner' ||
    profile.profileType.toLowerCase() === 'business'
    ? UserRole.OWNER
    : UserRole.CUSTOMER;
}

/**
 * Values used when creating a brand-new local account. MCOM Central is the
 * identity source of truth; the mall only needs a safe fallback when a legacy
 * token omits a person's name or phone number.
 */
export function buildNewUserIdentity(centralUser: any): {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
} {
  const profile = normalizeCentralUser(centralUser);
  const email = profile.email || clean(centralUser?.email) || '';
  const emailName = email.split('@')[0] || 'User';

  let firstName = profile.firstName;
  let lastName = profile.lastName;

  if (!firstName && !lastName) {
    // For businesses `name` is the business name, never the person's name.
    const fallback =
      profile.role === 'business' || profile.role === 'owner'
        ? emailName
        : profile.displayName || profile.fullName || emailName;
    const split = splitName(fallback);
    firstName = split.firstName;
    lastName = split.lastName;
  }

  return {
    firstName: firstName || 'User',
    lastName: lastName || 'User',
    phoneNumber:
      profile.phone || `00000000${Math.floor(1000 + Math.random() * 9000)}`,
    role: resolveLocalRole(centralUser),
  };
}

function sameJson(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/**
 * Diff the canonical Central identity against the local user row and persist
 * only the fields that actually changed. Runs on every SSO login so edits made
 * on MCOM Central propagate to the mall immediately.
 */
export async function syncLocalUserFromCentral(
  userRepository: Repository<User>,
  localUser: User,
  centralUser: any,
): Promise<User> {
  const profile = normalizeCentralUser(centralUser);
  const updates: Partial<User> = {};

  if (profile.hasExplicitName) {
    const firstName = profile.firstName || localUser.firstName;
    const lastName = profile.lastName || localUser.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    if (localUser.firstName !== firstName) updates.firstName = firstName;
    if (localUser.lastName !== lastName) updates.lastName = lastName;
    if (localUser.fullName !== fullName) updates.fullName = fullName;
  }

  if (profile.email && profile.email !== localUser.email) {
    const owner = await userRepository.findOne({
      where: { email: profile.email },
    });
    if (!owner || owner.id === localUser.id) {
      updates.email = profile.email;
    }
  }

  if (profile.phone && profile.phone !== localUser.phoneNumber) {
    const owner = await userRepository.findOne({
      where: { phoneNumber: profile.phone },
    });
    if (!owner || owner.id === localUser.id) {
      updates.phoneNumber = profile.phone;
    }
  }

  if (profile.avatarUrl && profile.avatarUrl !== localUser.profilePictureUrl) {
    updates.profilePictureUrl = profile.avatarUrl;
  }

  if (profile.jobTitle && profile.jobTitle !== localUser.jobTitle) {
    updates.jobTitle = profile.jobTitle;
  }

  if (profile.address && profile.address !== localUser.address) {
    updates.address = profile.address;
  }

  if (profile.postcode && profile.postcode !== localUser.postcode) {
    updates.postcode = profile.postcode;
  }

  if (profile.country && profile.country !== localUser.country) {
    updates.country = profile.country;
  }

  if (
    typeof centralUser?.isAffiliate === 'boolean' &&
    centralUser.isAffiliate !== localUser.isAffiliate
  ) {
    updates.isAffiliate = centralUser.isAffiliate;
  }

  if (
    localUser.role !== UserRole.ADMIN &&
    resolveLocalRole(centralUser) !== localUser.role
  ) {
    updates.role = resolveLocalRole(centralUser);
  }

  if (
    profile.centralUserId &&
    profile.centralUserId !== localUser.centralUserId
  ) {
    updates.centralUserId = profile.centralUserId;
  }

  // Always keep the canonical snapshot + sync timestamp. This is the raw
  // payload the mall can render for fields it does not model locally.
  if (!sameJson(localUser.centralProfile, profile.raw)) {
    updates.centralProfile = profile.raw;
  }
  updates.centralProfileSyncedAt = new Date();

  await userRepository.update(localUser.id, updates);

  return Object.assign(localUser, updates);
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max - 1).trimEnd() + '…' : value;
}

function toCountryCode(country: string | null): string | null {
  if (!country) return null;
  const key = country.trim().toLowerCase();
  if (COUNTRY_CODES[key]) return COUNTRY_CODES[key];
  if (/^[a-z]{2}$/i.test(key)) return key.toUpperCase();
  return null;
}

async function resolvePostcode(postcode: string): Promise<{
  latitude: number;
  longitude: number;
  borough: string;
}> {
  let latitude = 51.5074;
  let longitude = -0.1278;
  let borough = 'London';

  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(
        postcode.replace(/\s+/g, ''),
      )}`,
    );
    if (response.ok) {
      const body: any = await response.json();
      if (body?.status === 200 && body.result) {
        latitude = body.result.latitude;
        longitude = body.result.longitude;
        const rawBorough =
          body.result.admin_district || body.result.region || '';
        borough =
          rawBorough
            .replace(/London Borough of /i, '')
            .replace(/Borough of /i, '')
            .replace(/City of /i, '')
            .replace(/Royal Borough of /i, '')
            .trim() || 'London';
      }
    }
  } catch {
    // Network/geocoding failures must never block a login.
  }

  return { latitude, longitude, borough };
}

function parseSocialLinks(
  value: unknown,
): Array<{ platform: string; url: string }> {
  let parsed = value;

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  const record = asRecord(parsed);
  if (!record) return [];

  return Object.entries(record)
    .map(([platform, url]) => ({
      platform: platform.trim().toLowerCase(),
      url: clean(url) || '',
    }))
    .filter((entry) => entry.platform && entry.url);
}

async function syncSocialLinks(
  dataSource: DataSource,
  business: Business,
  socialMedia: unknown,
): Promise<void> {
  const links = parseSocialLinks(socialMedia);
  if (!links.length) return;

  const repository = dataSource.getRepository(SocialLink);

  for (const link of links) {
    const existing = await repository.findOne({
      where: { business: { id: business.id }, platform: link.platform },
    });

    if (existing) {
      if (existing.url !== link.url) {
        await repository.update(existing.id, { url: link.url });
      }
      continue;
    }

    const created = repository.create({
      platform: link.platform,
      url: link.url,
      business: { id: business.id } as Business,
    });
    await repository.save(created);
  }
}

async function resolveTaxonomy(
  dataSource: DataSource,
  profile: NormalizedBusinessProfile,
): Promise<Partial<Business>> {
  const updates: Partial<Business> = {};

  try {
    if (profile.category) {
      const category = await dataSource
        .getRepository(TaxonomyCategory)
        .findOne({
          where: { name: ILike(profile.category) },
        });
      if (category) {
        updates.categoryId = category.id;
        updates.sectorId = category.sectorId;
      }
    }

    if (profile.subCategory) {
      const subcategory = await dataSource
        .getRepository(TaxonomySubcategory)
        .findOne({ where: { name: ILike(profile.subCategory) } });
      if (subcategory) {
        updates.subCategoryId = subcategory.id;
        if (!updates.categoryId) updates.categoryId = subcategory.categoryId;
      }
    }

    if (profile.industry) {
      const sector = await dataSource.getRepository(Sector).findOne({
        where: { name: ILike(profile.industry) },
      });
      if (sector) updates.sectorId = sector.id;
    }
  } catch {
    // Taxonomy tables may not contain a matching label. Never block login.
  }

  return updates;
}

function businessUpdatesFromProfile(
  existing: Business,
  profile: NormalizedBusinessProfile,
): Partial<Business> {
  const updates: Partial<Business> = {};

  if (profile.businessName && existing.businessName !== profile.businessName) {
    updates.businessName = profile.businessName;
  }
  if (profile.phone && existing.businessPhone !== profile.phone) {
    updates.businessPhone = profile.phone;
  }
  if (profile.email && existing.businessEmail !== profile.email) {
    updates.businessEmail = profile.email;
  }
  if (profile.website && existing.website !== profile.website) {
    updates.website = profile.website;
  }
  if (profile.logoUrl && existing.logoUrl !== profile.logoUrl) {
    updates.logoUrl = profile.logoUrl;
  }
  if (profile.description) {
    if (existing.about !== profile.description) {
      updates.about = profile.description;
    }
    if (profile.description.length >= 20) {
      const short = truncate(profile.description, 180);
      if (existing.shortDescription !== short) {
        updates.shortDescription = short;
      }
    }
  }
  if (profile.businessType && existing.businessType !== profile.businessType) {
    updates.businessType = profile.businessType;
  }
  if (profile.industry && existing.industry !== profile.industry) {
    updates.industry = profile.industry;
  }
  if (profile.category && existing.centralCategory !== profile.category) {
    updates.centralCategory = profile.category;
  }
  if (
    profile.subCategory &&
    existing.centralSubCategory !== profile.subCategory
  ) {
    updates.centralSubCategory = profile.subCategory;
  }
  if (profile.openingHours && existing.openingHours !== profile.openingHours) {
    updates.openingHours = profile.openingHours;
  }
  if (
    profile.centralBusinessId &&
    existing.centralBusinessId !== profile.centralBusinessId
  ) {
    updates.centralBusinessId = profile.centralBusinessId;
  }
  if (
    typeof profile.isOnGoogle === 'boolean' &&
    existing.isGoogleVerified !== profile.isOnGoogle
  ) {
    updates.isGoogleVerified = profile.isOnGoogle;
  }

  if (!sameJson(existing.centralProfile, profile.raw)) {
    updates.centralProfile = profile.raw;
  }
  updates.centralProfileSyncedAt = new Date();

  return updates;
}

async function syncLocation(
  dataSource: DataSource,
  business: Business,
  profile: NormalizedBusinessProfile,
  existingLocation?: Location | null,
): Promise<void> {
  const address = profile.address;
  const postcode = profile.postcode
    ? profile.postcode.trim().toUpperCase()
    : null;
  const countryCode = toCountryCode(profile.country);

  const repository = dataSource.getRepository(Location);
  const location =
    existingLocation ??
    (await repository.findOne({ where: { business: { id: business.id } } }));

  if (!location) {
    if (!address && !postcode) return;

    const cleanPostcode = postcode || 'SW1A 1AA';
    const geo = await resolvePostcode(cleanPostcode);

    const created = repository.create({
      business: { id: business.id } as Business,
      addressLine1: address || 'High Street',
      postcode: cleanPostcode,
      city: geo.borough,
      countryCode: countryCode || 'GB',
      latitude: geo.latitude,
      longitude: geo.longitude,
      showPublicly: true,
    });
    await repository.save(created);
    return;
  }

  const updates: Partial<Location> = {};

  if (address && location.addressLine1 !== address) {
    updates.addressLine1 = address;
  }
  if (postcode && location.postcode !== postcode) {
    updates.postcode = postcode;

    const geo = await resolvePostcode(postcode);
    updates.city = geo.borough;
    updates.latitude = geo.latitude;
    updates.longitude = geo.longitude;
  }
  if (countryCode && location.countryCode !== countryCode) {
    updates.countryCode = countryCode;
  }

  if (Object.keys(updates).length) {
    await repository.update(location.id, updates);
  }
}

async function provisionBusiness(
  dataSource: DataSource,
  localUser: User,
  profile: NormalizedBusinessProfile,
  logger?: Logger,
): Promise<Business> {
  const businessRepository = dataSource.getRepository(Business);
  const locationRepository = dataSource.getRepository(Location);

  const cleanPostcode = (profile.postcode || 'SW1A 1AA').trim().toUpperCase();
  const address = profile.address || 'High Street';
  const geo = await resolvePostcode(cleanPostcode);

  const mallName = `${geo.borough} Local Mall`;
  const localMallRepository = dataSource.getRepository(LocalMall);
  let localMall = await localMallRepository.findOne({
    where: { name: mallName },
  });
  if (!localMall) {
    localMall = await localMallRepository.save(
      localMallRepository.create({
        name: mallName,
        latitude: geo.latitude,
        longitude: geo.longitude,
      }),
    );
  }

  const activatedRegionRepository = dataSource.getRepository(ActivatedRegion);
  const activeRegion = await activatedRegionRepository.findOne({
    where: { name: geo.borough },
  });
  if (!activeRegion) {
    await activatedRegionRepository.save(
      activatedRegionRepository.create({
        name: geo.borough,
        isActive: true,
      }),
    );
  } else if (!activeRegion.isActive) {
    activeRegion.isActive = true;
    await activatedRegionRepository.save(activeRegion);
  }

  const description = profile.description || '';
  const business = businessRepository.create({
    user: { id: localUser.id } as User,
    businessName: profile.businessName || `${localUser.firstName} Storefront`,
    businessType: profile.businessType || undefined,
    industry: profile.industry || undefined,
    centralCategory: profile.category || undefined,
    centralSubCategory: profile.subCategory || undefined,
    centralBusinessId: profile.centralBusinessId || undefined,
    openingHours: profile.openingHours || undefined,
    businessPhone: profile.phone || '0000000000',
    businessEmail: profile.email || localUser.email,
    website: profile.website || undefined,
    logoUrl: profile.logoUrl || undefined,
    shortDescription:
      description.length >= 20
        ? truncate(description, 180)
        : 'Hyperlocal business listing imported from MCOM Ecosystem.',
    about: description || undefined,
    listingType: [ListingType.PRODUCT, ListingType.SERVICE],
    status: BusinessStatus.PUBLISHED,
    isVerified: true,
    isGoogleVerified: profile.isOnGoogle ?? false,
    localMall: localMall ? ({ id: localMall.id } as LocalMall) : undefined,
    centralProfile: profile.raw,
    centralProfileSyncedAt: new Date(),
  });

  const saved = await businessRepository.save(business);

  const location = locationRepository.create({
    business: { id: saved.id } as Business,
    postcode: cleanPostcode,
    addressLine1: address,
    city: geo.borough,
    countryCode: toCountryCode(profile.country) || 'GB',
    latitude: geo.latitude,
    longitude: geo.longitude,
    showPublicly: true,
  });
  await locationRepository.save(location);

  await syncSocialLinks(dataSource, saved, profile.socialMedia);

  const taxonomy = await resolveTaxonomy(dataSource, profile);
  if (Object.keys(taxonomy).length) {
    await businessRepository.update(saved.id, taxonomy);
    Object.assign(saved, taxonomy);
  }

  logger?.log(`[SSO JIT] Provisioned business listing for ${localUser.email}`);
  return saved;
}

/**
 * Sync the local storefront (business + location + socials + taxonomy) with
 * the canonical Central business profile. Creates the storefront on first
 * login for business accounts.
 */
export async function syncLocalBusinessFromCentral(
  dataSource: DataSource,
  localUser: User,
  centralUser: any,
  logger?: Logger,
): Promise<Business | null> {
  const normalized = normalizeCentralUser(centralUser);
  const profile = normalized.business;

  if (!profile) return null;

  const businessRepository = dataSource.getRepository(Business);
  const existing = await businessRepository.findOne({
    where: { user: { id: localUser.id } },
    relations: ['location', 'socialLinks'],
  });

  if (!existing) {
    return provisionBusiness(dataSource, localUser, profile, logger);
  }

  const updates = businessUpdatesFromProfile(existing, profile);
  if (Object.keys(updates).length) {
    await businessRepository.update(existing.id, updates);
    Object.assign(existing, updates);
  }

  await syncLocation(dataSource, existing, profile, (existing as any).location);
  await syncSocialLinks(dataSource, existing, profile.socialMedia);

  const taxonomy = await resolveTaxonomy(dataSource, profile);
  if (Object.keys(taxonomy).length) {
    const changed = Object.entries(taxonomy).some(
      ([key, value]) => (existing as any)[key] !== value,
    );
    if (changed) {
      await businessRepository.update(existing.id, taxonomy);
      Object.assign(existing, taxonomy);
    }
  }

  return existing;
}

export interface CentralIdentitySyncResult {
  user: User;
  business: Business | null;
}

/**
 * Single entry point used by both SSO login paths (authorization-code exchange
 * and legacy launch token). Keeps the local account + storefront aligned with
 * MCOM Central on every login.
 */
export async function syncCentralIdentity(params: {
  userRepository: Repository<User>;
  dataSource: DataSource;
  localUser: User;
  centralUser: any;
  logger?: Logger;
}): Promise<CentralIdentitySyncResult> {
  const { userRepository, dataSource, localUser, centralUser, logger } = params;

  const user = await syncLocalUserFromCentral(
    userRepository,
    localUser,
    centralUser,
  );

  let business: Business | null = null;
  if (user.role === UserRole.OWNER) {
    business = await syncLocalBusinessFromCentral(
      dataSource,
      user,
      centralUser,
      logger,
    );
  }

  return { user, business };
}
