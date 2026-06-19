import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';
import { SubmitAuditDto } from './dto/submit-audit.dto';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { AuditType } from './enums/audit-type.enum';

@Injectable()
export class AuditsService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  private async calculateStorefrontScore(userId: string): Promise<number> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
      relations: ['products', 'services'],
    });

    let score = 30; // base score
    if (!business) return score;

    if (business.logoUrl) score += 20;
    if (business.bannerUrl) score += 20;
    if (business.shortDescription || business.about) score += 15;
    if (business.products && business.products.length > 0) score += 10;
    if (business.services && business.services.length > 0) score += 5;

    return Math.min(100, score);
  }

  async submitAudit(userId: string, dto: SubmitAuditDto): Promise<Audit> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let business: Business | undefined;
    if (dto.businessId) {
      business = await this.businessRepository.findOne({ where: { id: dto.businessId } });
    }

    // Dynamic scoring calculation based on answers
    let score = 55; // Base starting score
    const responses = dto.responses || {};

    if (responses.campaignFrequency === 'daily') score += 15;
    else if (responses.campaignFrequency === 'weekly') score += 10;
    else if (responses.campaignFrequency === 'monthly') score += 5;

    if (responses.hasLoyalty === 'yes') score += 10;
    if (responses.googleVerified === 'yes') score += 15;
    if (responses.hasPromotions === 'yes') score += 10;
    if (responses.profileComplete === 'yes') score += 10;

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Dynamic suggestions generation
    const suggestions = [];

    if (responses.hasLoyalty !== 'yes') {
      suggestions.push({
        id: 'sug-loyalty',
        title: 'Activate Loyalty Vouchers',
        description: 'Set up a recurring loyalty voucher campaign to incentivize repeat visits and boost sales.',
        category: 'vouchers',
        impact: 'High',
        actionLink: '/dashboard/membership-audits/vouchers',
        status: 'active',
      });
    }

    if (responses.campaignFrequency === 'rarely' || !responses.campaignFrequency) {
      suggestions.push({
        id: 'sug-campaign',
        title: 'Launch Weekly Campaign Rotations',
        description: 'Create regular ad campaigns to keep local customers engaged and interested in your storefront.',
        category: 'campaigns',
        impact: 'Medium',
        actionLink: '/dashboard/marketing',
        status: 'active',
      });
    }

    if (responses.googleVerified !== 'yes') {
      suggestions.push({
        id: 'sug-google',
        title: 'Verify Google Business Listing',
        description: 'Sync and verify your Google Place profile to rank higher in local search results.',
        category: 'visibility',
        impact: 'High',
        actionLink: '/dashboard/membership-audits/audits',
        status: 'active',
      });
    }

    if (responses.profileComplete !== 'yes') {
      suggestions.push({
        id: 'sug-profile',
        title: 'Enhance Product Metadata',
        description: 'Complete your listings profile, add descriptions, and upload product catalog images.',
        category: 'storefront',
        impact: 'Medium',
        actionLink: '/dashboard/storefront',
        status: 'active',
      });
    }

    // AI Projected Revenue Lift estimation
    const revenueLift = Number(((100 - score) * 0.35 + 5).toFixed(1));

    const audit = new Audit();
    audit.type = dto.type;
    audit.score = score;
    audit.storefrontScore = await this.calculateStorefrontScore(userId);
    audit.revenueLift = revenueLift;
    audit.responses = responses;
    audit.suggestions = suggestions;
    audit.userId = userId;
    if (business) {
      audit.businessId = business.id;
    }

    return this.auditRepository.save(audit);
  }

  async getLatestAudit(userId: string, businessId?: string): Promise<Audit> {
    const query = this.auditRepository.createQueryBuilder('audit')
      .where('audit.userId = :userId', { userId });

    if (businessId) {
      query.andWhere('audit.businessId = :businessId', { businessId });
    }

    query.orderBy('audit.created_at', 'DESC');
    const latest = await query.getOne();

    if (latest) {
      latest.storefrontScore = await this.calculateStorefrontScore(userId);
      return latest;
    }

    // Default template audit for empty states / onboarding
    const defaultAudit = new Audit();
    defaultAudit.id = 'default-placeholder-id';
    defaultAudit.type = AuditType.SHORT;
    defaultAudit.score = 72;
    defaultAudit.storefrontScore = await this.calculateStorefrontScore(userId);
    defaultAudit.revenueLift = 18.5;
    defaultAudit.responses = {};
    defaultAudit.suggestions = [
      {
        id: 'sug-loyalty',
        title: 'Activate Loyalty Vouchers',
        description: 'Set up a recurring loyalty voucher campaign to incentivize repeat visits and boost sales.',
        category: 'vouchers',
        impact: 'High',
        actionLink: '/dashboard/membership-audits/vouchers',
        status: 'active',
      },
      {
        id: 'sug-profile',
        title: 'Enhance Product Metadata',
        description: 'Complete your listings profile, add descriptions, and upload product catalog images.',
        category: 'storefront',
        impact: 'Medium',
        actionLink: '/dashboard/storefront',
        status: 'active',
      }
    ];
    defaultAudit.userId = userId;
    defaultAudit.created_at = new Date();
    defaultAudit.updated_at = new Date();

    return defaultAudit;
  }

  async getAuditHistory(userId: string, businessId?: string): Promise<Audit[]> {
    const findOptions: any = {
      where: { userId },
      order: { created_at: 'DESC' },
    };

    if (businessId) {
      findOptions.where.businessId = businessId;
    }

    const audits = await this.auditRepository.find(findOptions);
    for (const audit of audits) {
      audit.storefrontScore = await this.calculateStorefrontScore(userId);
    }
    return audits;
  }
}
