import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { PromotionalCampaign } from './entities/promotional-campaign.entity';
import { PromotionalCampaignItem } from './entities/promotional-campaign-item.entity';
import {
  CampaignParticipationStatus,
  PromotionalCampaignBusiness,
} from './entities/promotional-campaign-business.entity';
import {
  CreatePromotionalCampaignDto,
  PromotionalCampaignQueryDto,
  RespondToCampaignDto,
  UpdatePromotionalCampaignDto,
} from './dto/promotional-campaign.dto';

@Injectable()
export class PromotionalCampaignsService {
  constructor(
    @InjectRepository(PromotionalCampaign)
    private readonly campaignRepository: Repository<PromotionalCampaign>,
    @InjectRepository(PromotionalCampaignItem)
    private readonly itemRepository: Repository<PromotionalCampaignItem>,
    @InjectRepository(PromotionalCampaignBusiness)
    private readonly participantRepository: Repository<PromotionalCampaignBusiness>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  private campaignPatch(
    dto: CreatePromotionalCampaignDto | UpdatePromotionalCampaignDto,
  ): Record<string, unknown> {
    const patch: Record<string, unknown> = { ...dto };
    delete patch.items;
    delete patch.businessIds;
    if ('startDate' in patch) {
      patch.startDate = patch.startDate
        ? new Date(String(patch.startDate))
        : null;
    }
    if ('endDate' in patch) {
      patch.endDate = patch.endDate ? new Date(String(patch.endDate)) : null;
    }
    return patch;
  }

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------

  async getStats() {
    const [total, active, draft, inactive, participants] = await Promise.all([
      this.campaignRepository.count(),
      this.campaignRepository.count({ where: { status: 'active' } }),
      this.campaignRepository.count({ where: { status: 'draft' } }),
      this.campaignRepository.count({ where: { status: 'inactive' } }),
      this.participantRepository.count({ where: { status: 'accepted' } }),
    ]);
    return { total, active, draft, inactive, acceptedParticipants: participants };
  }

  async findAll(query: PromotionalCampaignQueryDto) {
    const { page = 1, limit = 20, search, status } = query;
    const qb = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.items', 'item')
      .leftJoinAndSelect('campaign.participants', 'participant')
      .leftJoinAndSelect('participant.business', 'participantBusiness')
      .orderBy('campaign.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('(campaign.name ILIKE :search OR campaign.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (status) {
      qb.andWhere('campaign.status = :status', { status });
    }

    const [campaigns, total] = await qb.getManyAndCount();
    return {
      data: campaigns.map((campaign) => this.mapCampaign(campaign)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['items', 'participants', 'participants.business'],
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return this.mapCampaign(campaign);
  }

  async create(dto: CreatePromotionalCampaignDto, adminId?: string) {
    const campaign = this.campaignRepository.create({
      ...(this.campaignPatch(dto) as Partial<PromotionalCampaign>),
      status: dto.status ?? 'draft',
      availableToAll: dto.availableToAll ?? false,
      createdById: adminId ?? null,
    });
    const saved = await this.campaignRepository.save(campaign);

    if (dto.items?.length) {
      await this.replaceItems(saved.id, dto.items);
    }
    if (dto.businessIds?.length || dto.availableToAll === false) {
      await this.replaceParticipants(saved.id, dto.businessIds ?? []);
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdatePromotionalCampaignDto) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    Object.assign(campaign, this.campaignPatch(dto));
    await this.campaignRepository.save(campaign);

    if (dto.items !== undefined) {
      await this.replaceItems(id, dto.items);
    }
    if (dto.businessIds !== undefined || dto.availableToAll !== undefined) {
      await this.replaceParticipants(id, dto.businessIds ?? []);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    await this.campaignRepository.softDelete(id);
    return { message: 'Campaign archived.' };
  }

  private async replaceItems(
    campaignId: string,
    items: CreatePromotionalCampaignDto['items'],
  ) {
    await this.itemRepository.delete({ campaignId });
    if (!items?.length) return;

    const records = items.map((item, index) =>
      this.itemRepository.create({
        campaignId,
        itemType: item.itemType,
        productId: item.productId ?? null,
        serviceId: item.serviceId ?? null,
        offerId: item.offerId ?? null,
        ownerBusinessId: item.ownerBusinessId ?? null,
        advertiserBusinessId: item.advertiserBusinessId ?? null,
        title: item.title,
        imageUrl: item.imageUrl ?? null,
        price: item.price ?? null,
        destinationUrl: item.destinationUrl ?? null,
        displayOrder: item.displayOrder ?? index,
      }),
    );
    await this.itemRepository.save(records);
  }

  private async replaceParticipants(campaignId: string, businessIds: string[]) {
    const existing = await this.participantRepository.find({
      where: { campaignId },
    });
    const existingMap = new Map(
      existing.map((participant) => [participant.businessId, participant]),
    );

    await this.participantRepository.delete({ campaignId });

    const unique = Array.from(new Set(businessIds.filter(Boolean)));
    if (!unique.length) return;

    const businesses = await this.businessRepository.find({
      where: { id: In(unique) },
      select: ['id'],
    });
    if (businesses.length !== unique.length) {
      throw new BadRequestException(
        'One or more participating businesses could not be found.',
      );
    }

    await this.participantRepository.save(
      businesses.map((business) => {
        const previous = existingMap.get(business.id);
        return this.participantRepository.create({
          campaignId,
          businessId: business.id,
          status: previous?.status ?? 'invited',
          invitedAt: previous?.invitedAt ?? new Date(),
          respondedAt: previous?.respondedAt ?? null,
        });
      }),
    );
  }

  private mapCampaign(campaign: PromotionalCampaign) {
    const items = [...(campaign.items ?? [])].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
    const participants = campaign.participants ?? [];
    return {
      ...campaign,
      items,
      participants: participants.map((participant) => ({
        id: participant.id,
        businessId: participant.businessId,
        businessName: participant.business?.businessName || 'Business',
        status: participant.status,
        invitedAt: participant.invitedAt,
        respondedAt: participant.respondedAt,
      })),
      acceptedCount: participants.filter(
        (participant) => participant.status === 'accepted',
      ).length,
    };
  }

  // ---------------------------------------------------------------------------
  // Business
  // ---------------------------------------------------------------------------

  private async getBusinessForUser(userId: string) {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!business) {
      throw new BadRequestException(
        'No business profile is linked to this account.',
      );
    }
    return business;
  }

  async getForBusiness(userId: string) {
    const business = await this.getBusinessForUser(userId);

    const qb = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.items', 'item')
      .leftJoinAndSelect('campaign.participants', 'participant')
      .leftJoinAndSelect('participant.business', 'participantBusiness')
      .where('campaign.status = :status', { status: 'active' })
      .andWhere('(campaign.startDate IS NULL OR campaign.startDate <= NOW())')
      .andWhere('(campaign.endDate IS NULL OR campaign.endDate >= NOW())')
      .andWhere(
        `(
          campaign.availableToAll = true
          OR EXISTS (
            SELECT 1 FROM promotional_campaign_businesses pcb
            WHERE pcb."campaignId" = campaign.id
              AND pcb."businessId" = :businessId
          )
        )`,
        { businessId: business.id },
      )
      .orderBy('campaign.isFeatured', 'DESC')
      .addOrderBy('campaign.startDate', 'ASC');

    const campaigns = await qb.getMany();

    const data = campaigns.map((campaign) => {
      const participation = campaign.participants?.find(
        (participant) => participant.businessId === business.id,
      );
      return {
        ...this.mapCampaign(campaign),
        participationStatus: participation?.status ?? 'invited',
        respondedAt: participation?.respondedAt ?? null,
      };
    });

    return {
      businessId: business.id,
      businessName: business.businessName,
      data,
      total: data.length,
    };
  }

  async respond(userId: string, campaignId: string, dto: RespondToCampaignDto) {
    const business = await this.getBusinessForUser(userId);
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'active') {
      throw new BadRequestException('This campaign is not open for responses.');
    }

    let participant = await this.participantRepository.findOne({
      where: { campaignId, businessId: business.id },
    });

    if (!participant) {
      if (!campaign.availableToAll) {
        throw new ForbiddenException(
          'This campaign has not been made available to your business.',
        );
      }
      participant = this.participantRepository.create({
        campaignId,
        businessId: business.id,
        status: 'invited',
        invitedAt: new Date(),
      });
    }

    if (
      participant.status !== 'invited' &&
      participant.status !== 'withdrawn' &&
      dto.status !== 'withdrawn'
    ) {
      throw new BadRequestException(
        'You have already responded to this campaign.',
      );
    }
    if (dto.status === 'withdrawn' && participant.status === 'withdrawn') {
      return participant;
    }

    participant.status = dto.status;
    participant.respondedAt = new Date();
    participant.note = dto.note ?? participant.note;
    return this.participantRepository.save(participant);
  }

  // ---------------------------------------------------------------------------
  // Public storefront
  // ---------------------------------------------------------------------------

  async getPublicForBusiness(businessId: string) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    const qb = this.campaignRepository
      .createQueryBuilder('campaign')
      .innerJoin(
        PromotionalCampaignBusiness,
        'participation',
        'participation.campaignId = campaign.id AND participation.businessId = :businessId AND participation.status = :accepted',
        { businessId, accepted: 'accepted' },
      )
      .leftJoinAndSelect('campaign.items', 'item')
      .where('campaign.status = :status', { status: 'active' })
      .andWhere('(campaign.startDate IS NULL OR campaign.startDate <= NOW())')
      .andWhere('(campaign.endDate IS NULL OR campaign.endDate >= NOW())')
      .orderBy('campaign.isFeatured', 'DESC')
      .addOrderBy('campaign.startDate', 'ASC');

    const campaigns = await qb.getMany();

    return {
      businessId: business.id,
      businessName: business.businessName,
      data: campaigns.map((campaign) => {
        const { participants, ...rest } = this.mapCampaign(campaign);
        return {
          ...rest,
          items: [...(campaign.items ?? [])]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((item) => ({
              id: item.id,
              itemType: item.itemType,
              productId: item.productId,
              serviceId: item.serviceId,
              offerId: item.offerId,
              title: item.title,
              imageUrl: item.imageUrl,
              price: item.price,
              destinationUrl: item.destinationUrl,
              ownerBusinessId: item.ownerBusinessId,
            })),
        };
      }),
    };
  }
}
