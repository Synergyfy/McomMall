import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { LocalMall } from './entities/localmall.entity';
import { User } from '../users/entities/user.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { McomCentralService } from '../sso/mcom-central.service';
import { UserRole } from '../../common/role.enum';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';

type PartnershipState =
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'partners'
  | 'declined';

interface PartnerCandidate {
  businessId: string;
  userId: string;
  businessName: string;
  ownerName: string;
  ownerAvatarUrl: string | null;
  logoUrl: string | null;
  category: string;
  description: string | null;
  address: string;
  postcode: string | null;
  isVerified: boolean;
  isClaimed: boolean;
  matchPercent: number;
  matchLabel: string;
  distanceMiles: number | null;
  partnershipStatus: PartnershipState;
}

interface FeedBusiness {
  id: string;
  businessName: string;
  shortDescription: string | null;
  logoUrl: string | null;
  category: string;
  address: string;
  postcode: string | null;
  isClaimed: boolean;
  isVerified: boolean;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  source: 'central' | 'mall';
}

function outwardCode(postcode?: string | null): string | null {
  if (!postcode) return null;
  const clean = postcode.toUpperCase().replace(/\s+/g, '');
  return clean.length > 3 ? clean.slice(0, clean.length - 3) : null;
}

function normaliseName(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

@Injectable()
export class LocalMallFeedService {
  private readonly logger = new Logger(LocalMallFeedService.name);

  constructor(
    private readonly central: McomCentralService,
    @InjectRepository(LocalMall)
    private readonly localMallRepository: Repository<LocalMall>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
  ) {}

  /**
   * Builds the `/dashboard/localmall` payload from the local mall Central has
   * assigned to the authenticated user. Central remains the source of truth for
   * the mall identity, hierarchy and member businesses; the mall database adds
   * its own offers/campaigns and points data on top.
   */
  async getCustomerFeed(params: {
    user?: User | null;
    postcode?: string | null;
    lat?: string | null;
    lon?: string | null;
  }) {
    // `@CurrentUser()` is the JWT payload, which deliberately carries only
    // identity claims. Load the profile row so postcode/centralProfile data
    // from the last Central sync is available even for directly registered
    // customers.
    const profile = params.user?.id
      ? await this.userRepository.findOne({ where: { id: params.user.id } })
      : null;
    const user = profile ?? params.user ?? null;

    const myBusiness = user
      ? await this.businessRepository.findOne({
          where: { user: { id: user.id } },
          relations: ['location', 'localMall', 'category'],
        })
      : null;

    const postcode =
      (params.postcode || '').trim() ||
      myBusiness?.location?.postcode?.trim() ||
      user?.postcode?.trim() ||
      ((user?.centralProfile as any)?.postcode as string | undefined)?.trim() ||
      null;

    let centralMall: any = null;
    if (user?.centralUserId || postcode) {
      try {
        // Prefer the exact Central assignment. When the service-to-service
        // HMAC is unavailable/misconfigured, the public postcode resolver still
        // returns the City → Borough → High Street → Local Mall hierarchy.
        centralMall = await this.central.getLocalMallOrResolvePostcode({
          userId: user?.centralUserId || null,
          postcode,
        });
      } catch (error) {
        this.logger.warn(
          `Central local mall lookup failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    const resolvedPostcode =
      centralMall?.postcode || postcode || null;
    const outcode =
      centralMall?.outwardCode || outwardCode(resolvedPostcode) || null;

    // Fall back to the legacy mall database only when Central has no answer.
    const localMall = await this.findFallbackLocalMall(
      centralMall,
      myBusiness?.localMall,
    );

    const localBusinesses = await this.findLocalBusinesses(
      localMall?.id,
      outcode,
    );

    const businesses = this.mergeBusinesses(
      centralMall?.businesses || [],
      localBusinesses,
    );

    const { nearbyDeals, activeCampaigns } = this.buildOffersAndCampaigns(
      localBusinesses,
    );

    const mallPostcodes: string[] =
      centralMall?.mall?.postcodes ||
      (outcode ? [outcode] : []);

    // Partner distances are measured from the user's own storefront. Fall back
    // to the mall high street (or the postcode coordinates) when the business
    // has no precise location.
    const originLatitude =
      myBusiness?.location?.latitude ??
      centralMall?.highStreet?.latitude ??
      centralMall?.latitude ??
      null;
    const originLongitude =
      myBusiness?.location?.longitude ??
      centralMall?.highStreet?.longitude ??
      centralMall?.longitude ??
      null;

    const [consumerCount, pointsBalance, weeklyPointsEarned] =
      await Promise.all([
        this.countConsumers(centralMall),
        this.getPointsBalance(user),
        this.getWeeklyPoints(user),
      ]);

    // Partnership matching is a merchant-only capability. Customers browse
    // the same mall without receiving partner candidate data.
    const partnerCandidates =
      user && user.role !== UserRole.CUSTOMER
        ? await this.findPartnerCandidates({
            user,
            myBusiness,
            localMallId: localMall?.id ?? myBusiness?.localMallId ?? null,
            mallPostcodes,
            originLatitude,
            originLongitude,
          })
        : [];

    // Central is authoritative, but fall back to the published businesses in
    // the same outcode so the page still shows City → Borough → High Street →
    // Local Mall when the signed Central lookup is unavailable.
    const localHint = localBusinesses.find(
      (business) =>
        business.geoCityName ||
        business.geoBoroughName ||
        business.geoHighStreetName ||
        business.geoLocalMallName,
    );

    const city =
      centralMall?.city?.name ||
      localHint?.geoCityName ||
      myBusiness?.location?.city ||
      null;
    const borough =
      centralMall?.borough?.name ||
      centralMall?.mall?.borough ||
      localHint?.geoBoroughName ||
      myBusiness?.location?.resolvedArea ||
      myBusiness?.location?.city ||
      null;
    const resolvedHighStreet =
      centralMall?.highStreet?.name ||
      centralMall?.mall?.primaryHighStreet ||
      localHint?.geoHighStreetName ||
      null;
    const resolvedMallName =
      centralMall?.mall?.name ||
      localMall?.name ||
      localHint?.geoLocalMallName ||
      null;

    return {
      // Real local mall resolved from MCOM Central.
      mallId: centralMall?.mall?.id ?? localMall?.id ?? null,
      mallName: resolvedMallName,
      mall:
        centralMall?.mall ??
        (resolvedMallName ? { id: null, name: resolvedMallName } : null),
      matchType: centralMall?.matchType ?? null,
      distanceKm: centralMall?.distanceKm ?? null,
      city,
      borough,
      highStreet: resolvedHighStreet,
      postcode: resolvedPostcode,
      outwardCode: outcode,
      postcodes: centralMall?.mall?.postcodes ?? (outcode ? [outcode] : []),
      latitude:
        centralMall?.highStreet?.latitude ??
        centralMall?.latitude ??
        localHint?.geoLatitude ??
        localHint?.location?.latitude ??
        null,
      longitude:
        centralMall?.highStreet?.longitude ??
        centralMall?.longitude ??
        localHint?.geoLongitude ??
        localHint?.location?.longitude ??
        null,
      radiusCoverage: centralMall?.mall?.radiusCoverage ?? null,
      description: centralMall?.mall?.description ?? null,
      tagline: centralMall?.mall?.tagline ?? null,
      businesses,
      partnerCandidates,
      pointsBalance,
      weeklyPointsEarned,
      consumerCount,
      activeCampaigns,
      nearbyDeals,
    };
  }

  /**
   * Lists businesses in the same local mall that the signed-in owner can
   * partner with.
   *
   * This runs three small, indexed queries (candidates + requests +
   * partnerships) and does the join/status merge in memory — deliberately no
   * per-business lookups.
   */
  private async findPartnerCandidates(args: {
    user?: User | null;
    myBusiness?: Business | null;
    localMallId: string | null;
    mallPostcodes: string[];
    originLatitude: number | null;
    originLongitude: number | null;
  }): Promise<PartnerCandidate[]> {
    const userId = args.user?.id;
    if (!userId) return [];

    const patterns = [
      ...new Set(
        args.mallPostcodes
          .map((postcode) => (postcode || '').trim().toUpperCase())
          .filter((postcode) => /^[A-Z]{1,2}\d[A-Z\d]?$/.test(postcode)),
      ),
    ].map((postcode) => `${postcode}%`);

    const params: any[] = [userId];
    const conditions = [
      'business."deleted_at" IS NULL',
      `business.status = 'published'`,
      'owner."deleted_at" IS NULL',
      'owner.id <> $1',
      `owner.role = 'owner'`,
      `owner."isActive" = true`,
    ];

    if (args.myBusiness?.id) {
      params.push(args.myBusiness.id);
      conditions.push(`business.id <> $${params.length}`);
    }

    const scope: string[] = [];
    if (args.localMallId) {
      params.push(args.localMallId);
      scope.push(`business."localMallId" = $${params.length}`);
    }
    if (patterns.length) {
      params.push(patterns);
      // Stored postcodes are normalised to uppercase with a single space by
      // the Central sync, so a plain prefix LIKE can use the index below.
      scope.push(
        `location.postcode LIKE ANY($${params.length}::text[])`,
      );
    }
    if (!scope.length) return [];
    conditions.push(`(${scope.join(' OR ')})`);

    const rows: Array<{
      businessId: string;
      userId: string;
      businessName: string;
      logoUrl: string | null;
      shortDescription: string | null;
      isVerified: boolean;
      isClaimed: boolean;
      centralCategory: string | null;
      categoryName: string | null;
      ownerFirstName: string | null;
      ownerLastName: string | null;
      ownerAvatarUrl: string | null;
      postcode: string | null;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
    }> = await this.businessRepository.manager.query(
      `SELECT
         business.id                            AS "businessId",
         owner.id                               AS "userId",
         business."businessName"                AS "businessName",
         business."logoUrl"                     AS "logoUrl",
         business."shortDescription"            AS "shortDescription",
         business."isVerified"                  AS "isVerified",
         business."isClaimed"                   AS "isClaimed",
         business."centralCategory"             AS "centralCategory",
         category.name                          AS "categoryName",
         owner."firstName"                      AS "ownerFirstName",
         owner."lastName"                       AS "ownerLastName",
         owner."profilePictureUrl"              AS "ownerAvatarUrl",
         location.postcode                      AS "postcode",
         location."addressLine1"                AS "address",
         location.latitude                      AS "latitude",
         location.longitude                     AS "longitude"
       FROM businesses business
       JOIN users owner ON owner.id = business."userId"
       LEFT JOIN locations location ON location."businessId" = business.id
       LEFT JOIN taxonomy_categories category ON category.id = business."categoryId"
       WHERE ${conditions.join(' AND ')}
       ORDER BY business."businessName" ASC
       LIMIT 250`,
      params,
    );

    if (!rows.length) return [];

    const candidateUserIds = rows.map((row) => row.userId);
    const manager = this.businessRepository.manager;

    const [requestRows, partnerRows] = await Promise.all([
      manager.query(
        `SELECT "senderId", "receiverId", status
           FROM user_partnership_requests
          WHERE "deleted_at" IS NULL
            AND ("senderId" = $1 OR "receiverId" = $1)
            AND ("senderId" = ANY($2::uuid[]) OR "receiverId" = ANY($2::uuid[]))
          ORDER BY "sentAt" DESC`,
        [userId, candidateUserIds],
      ),
      manager.query(
        `SELECT "user1Id", "user2Id"
           FROM user_partnerships
          WHERE "isActive" = true
            AND ("user1Id" = $1 OR "user2Id" = $1)
            AND ("user1Id" = ANY($2::uuid[]) OR "user2Id" = ANY($2::uuid[]))`,
        [userId, candidateUserIds],
      ),
    ]);

    const statusByUser = new Map<string, PartnershipState>();
    for (const request of requestRows) {
      const otherUserId =
        request.senderId === userId ? request.receiverId : request.senderId;
      if (!otherUserId || statusByUser.has(otherUserId)) continue;

      if (request.status === 'accepted') {
        statusByUser.set(otherUserId, 'partners');
      } else if (request.status === 'pending') {
        statusByUser.set(
          otherUserId,
          request.senderId === userId ? 'pending_sent' : 'pending_received',
        );
      } else {
        statusByUser.set(otherUserId, 'declined');
      }
    }

    for (const partnership of partnerRows) {
      const otherUserId =
        partnership.user1Id === userId
          ? partnership.user2Id
          : partnership.user1Id;
      if (otherUserId) statusByUser.set(otherUserId, 'partners');
    }

    const myCategory =
      args.myBusiness?.category?.name ||
      args.myBusiness?.centralCategory ||
      args.myBusiness?.businessName ||
      '';
    const myType = this.categoryType(myCategory);

    return rows.map((row) => {
      const candidateType = this.categoryType(
        row.categoryName || row.centralCategory || row.businessName,
      );
      const distanceMiles = this.distanceMiles(
        args.originLatitude,
        args.originLongitude,
        row.latitude,
        row.longitude,
      );
      const match = this.matchFor(
        myType,
        candidateType,
        distanceMiles,
        Boolean(row.isVerified),
      );
      const ownerName =
        [row.ownerFirstName, row.ownerLastName].filter(Boolean).join(' ') ||
        row.businessName;

      return {
        businessId: row.businessId,
        userId: row.userId,
        businessName: row.businessName,
        ownerName,
        ownerAvatarUrl: row.ownerAvatarUrl || null,
        logoUrl: row.logoUrl || null,
        category: row.categoryName || row.centralCategory || 'Store',
        description: row.shortDescription || null,
        address: row.address || '',
        postcode: row.postcode || null,
        isVerified: Boolean(row.isVerified),
        isClaimed: Boolean(row.isClaimed),
        matchPercent: match.percent,
        matchLabel: match.label,
        distanceMiles,
        partnershipStatus: statusByUser.get(row.userId) || 'none',
      };
    });
  }

  private categoryType(value?: string | null): string {
    const name = (value || '').toLowerCase();
    if (
      /laptop|computer|tech|phone|mobile|electronic|gadget|software|system/.test(
        name,
      )
    ) {
      return 'tech';
    }
    if (
      /bakery|bread|cake|coffee|cafe|deli|food|restaurant|bistro|kitchen|wine|bar|diner|sweet/.test(
        name,
      )
    ) {
      return 'food';
    }
    if (
      /clothing|boutique|fashion|apparel|shoes|wear|tailor|style/.test(name)
    ) {
      return 'fashion';
    }
    if (
      /salon|barber|hair|spa|beauty|wellness|nails|yoga|gym|fitness|therapy/.test(
        name,
      )
    ) {
      return 'wellness';
    }
    return 'general';
  }

  /**
   * Deterministic partnership score from real inputs: sector compatibility,
   * distance between the two storefronts, and whether the candidate is
   * verified. It is a heuristic, not a random or hard-coded per-business value.
   */
  private matchFor(
    currentType: string,
    candidateType: string,
    distanceMiles: number | null,
    isVerified: boolean,
  ): { percent: number; label: string } {
    let percent = 50;
    let label = 'Local foot traffic';

    if (currentType === candidateType && currentType !== 'general') {
      percent += 35;
      label = 'Direct sector synergy';
    } else if (
      (currentType === 'tech' && candidateType === 'general') ||
      (currentType === 'food' && candidateType === 'general')
    ) {
      percent += 18;
      label = 'Ecosystem supplier';
    } else if (currentType === 'tech' && candidateType === 'food') {
      percent += 18;
      label = 'Remote work promo';
    } else if (currentType === 'food' && candidateType === 'tech') {
      percent += 18;
      label = 'Smart POS partner';
    } else if (
      currentType === candidateType &&
      currentType === 'general'
    ) {
      percent += 8;
      label = 'Local business network';
    }

    if (distanceMiles != null) {
      if (distanceMiles <= 1) percent += 10;
      else if (distanceMiles <= 3) percent += 6;
      else if (distanceMiles <= 10) percent += 3;
    }

    if (isVerified) percent += 3;

    return { percent: Math.min(98, percent), label };
  }

  /** Great-circle distance in miles (Haversine). */
  private distanceMiles(
    originLat: number | null,
    originLng: number | null,
    targetLat: number | null,
    targetLng: number | null,
  ): number | null {
    if (
      originLat == null ||
      originLng == null ||
      targetLat == null ||
      targetLng == null
    ) {
      return null;
    }

    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(targetLat - originLat);
    const dLon = toRad(targetLng - originLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(originLat)) *
        Math.cos(toRad(targetLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const km = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(km * 0.621371 * 10) / 10;
  }

  private async findFallbackLocalMall(
    centralMall: any,
    assignedMall?: LocalMall | null,
  ): Promise<LocalMall | null> {
    const centralName = centralMall?.mall?.name;
    if (centralName) {
      const match = await this.localMallRepository.findOne({
        where: { name: centralName },
      });
      if (match) return match;
    }
    return assignedMall ?? null;
  }

  private async findLocalBusinesses(
    localMallId: string | undefined,
    outcode: string | null,
  ): Promise<Business[]> {
    if (!localMallId && !outcode) return [];

    const query = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.location', 'location')
      .leftJoinAndSelect('business.category', 'category')
      .leftJoinAndSelect('business.user', 'owner')
      .leftJoinAndSelect('owner.offers', 'offers')
      .leftJoinAndSelect('business.campaigns', 'campaigns')
      .where('business.status = :status', {
        status: BusinessStatus.PUBLISHED,
      })
      .andWhere('business.deleted_at IS NULL');

    if (localMallId && outcode) {
      query.andWhere(
        '(business.localMallId = :localMallId OR location.postcode ILIKE :postcodePrefix)',
        { localMallId, postcodePrefix: `${outcode}%` },
      );
    } else if (localMallId) {
      query.andWhere('business.localMallId = :localMallId', { localMallId });
    } else {
      query.andWhere('location.postcode ILIKE :postcodePrefix', {
        postcodePrefix: `${outcode}%`,
      });
    }

    return query.getMany();
  }

  private localBusinessToFeed(business: Business): FeedBusiness {
    return {
      id: business.id,
      businessName: business.businessName,
      shortDescription: business.shortDescription || business.about || null,
      logoUrl: business.logoUrl || null,
      category: business.category?.name || business.centralCategory || 'Store',
      address: business.location?.addressLine1 || '',
      postcode: business.location?.postcode || null,
      isClaimed: business.isClaimed,
      isVerified: business.isVerified,
      phone: business.businessPhone || null,
      email: business.businessEmail || null,
      website: business.website || null,
      latitude: business.location?.latitude ?? null,
      longitude: business.location?.longitude ?? null,
      source: 'mall',
    };
  }

  /**
   * Merges Central's local-mall members with the mall database. When a Central
   * business also exists locally we always emit the local row: its id is what
   * the customer profile/listing page can actually open.
   */
  private mergeBusinesses(
    centralBusinesses: any[],
    localBusinesses: Business[],
  ): FeedBusiness[] {
    const merged: FeedBusiness[] = [];
    const seenCentralIds = new Set<string>();
    const seenLocalIds = new Set<string>();
    const seenNames = new Set<string>();

    const localById = new Map(
      localBusinesses.map((business) => [business.id, business]),
    );
    const localByCentralId = new Map(
      localBusinesses
        .filter((business) => Boolean(business.centralBusinessId))
        .map((business) => [business.centralBusinessId as string, business]),
    );
    const localByName = new Map(
      localBusinesses.map((business) => [
        normaliseName(business.businessName),
        business,
      ]),
    );

    for (const business of centralBusinesses) {
      if (!business?.id) continue;
      seenCentralIds.add(business.id);
      seenNames.add(normaliseName(business.businessName));

      const localMatch =
        localById.get(business.id) ||
        localByCentralId.get(business.id) ||
        localByName.get(normaliseName(business.businessName));

      if (localMatch) {
        seenLocalIds.add(localMatch.id);
        merged.push(this.localBusinessToFeed(localMatch));
        continue;
      }

      merged.push({
        id: business.id,
        businessName: business.businessName,
        shortDescription: business.shortDescription || business.description,
        logoUrl: business.logoUrl,
        category: business.category || business.businessType || 'Store',
        address: business.address || '',
        postcode: business.postcode || null,
        isClaimed: business.isClaimed ?? true,
        isVerified: business.isVerified ?? false,
        phone: business.phone || null,
        email: business.email || null,
        website: business.website || null,
        latitude: business.latitude ?? null,
        longitude: business.longitude ?? null,
        source: 'central',
      });
    }

    for (const business of localBusinesses) {
      if (seenLocalIds.has(business.id)) continue;
      const name = normaliseName(business.businessName);
      if (
        (business.centralBusinessId &&
          seenCentralIds.has(business.centralBusinessId)) ||
        seenNames.has(name)
      ) {
        continue;
      }
      seenNames.add(name);
      merged.push(this.localBusinessToFeed(business));
    }

    return merged.sort((a, b) =>
      a.businessName.localeCompare(b.businessName),
    );
  }

  private buildOffersAndCampaigns(businesses: Business[]) {
    const nearbyDeals: Array<{
      business: string;
      deal: string;
      points: number;
      expires: string;
    }> = [];
    const activeCampaigns: Array<{
      id: string;
      title: string;
      budget: number;
      expires: string;
    }> = [];

    const now = new Date();
    const daysLeft = (end?: Date | null) =>
      end
        ? Math.max(
            0,
            Math.ceil((new Date(end).getTime() - now.getTime()) / 86_400_000),
          )
        : 3;

    for (const business of businesses) {
      for (const offer of business.user?.offers || []) {
        if (
          !offer.isActive ||
          offer.approvalStatus !== ApprovalStatus.APPROVED ||
          offer.adminDisabled ||
          offer.isTimeBonus
        ) {
          continue;
        }
        if (offer.beginDate && new Date(offer.beginDate) > now) continue;
        if (offer.endDate && new Date(offer.endDate) < now) continue;
        nearbyDeals.push({
          business: business.businessName,
          deal: offer.name,
          points: offer.points || 0,
          expires: `${daysLeft(offer.endDate)}d`,
        });
      }

      for (const campaign of business.campaigns || []) {
        const isActive =
          new Date(campaign.startDate) <= now &&
          (!campaign.endDate || new Date(campaign.endDate) >= now);
        if (!isActive) continue;
        activeCampaigns.push({
          id: campaign.id,
          title: `${business.businessName} - ${String(campaign.type).replace(
            /_/g,
            ' ',
          )}`,
          budget: Number(campaign.budget) || 0,
          expires: `${daysLeft(campaign.endDate)}d`,
        });
      }
    }

    return { nearbyDeals, activeCampaigns };
  }

  private async countConsumers(centralMall: any): Promise<number> {
    // When Central resolved a mall, its customer count is authoritative — do
    // not inflate it with mall-wide or platform-wide figures.
    if (centralMall?.mall) {
      return Number(centralMall.mall.counts?.customers ?? 0);
    }
    return this.userRepository.count({
      where: { role: UserRole.CUSTOMER },
    });
  }

  private async getPointsBalance(user?: User | null): Promise<number> {
    if (!user?.id) return 0;
    const dbUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['id', 'points'],
    });
    return dbUser?.points ?? 0;
  }

  private async getWeeklyPoints(user?: User | null): Promise<number> {
    if (!user?.id) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('SUM(pt.points)', 'total')
      .where('pt.userId = :userId', { userId: user.id })
      .andWhere('pt.points > 0')
      .andWhere('pt.created_at >= :oneWeekAgo', { oneWeekAgo })
      .getRawOne();

    return result?.total ? parseInt(result.total, 10) : 0;
  }
}
