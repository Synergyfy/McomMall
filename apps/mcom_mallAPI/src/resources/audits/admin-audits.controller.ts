import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Audit } from './entities/audit.entity';

@ApiTags('Business Audits')
@ApiBearerAuth()
@Controller('business/audits/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAuditsController {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
  ) {}

  @Get('all')
  @ApiOperation({ summary: 'List all storefront audits with business and user (Admin only)' })
  @ApiOkResponse({ description: 'Audit list', type: [Audit] })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  findAll(@Query('businessId') businessId?: string): Promise<Audit[]> {
    return this.auditRepository.find({
      where: businessId ? { businessId } : {},
      relations: ['business', 'user'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit counts and average score (Admin only)' })
  @ApiOkResponse({ description: 'Audit statistics' })
  async getStats(): Promise<{
    total: number;
    avgScore: number;
    avgStorefrontScore: number;
    byType: { type: string; count: number }[];
  }> {
    const [total, avgRow, byType] = await Promise.all([
      this.auditRepository.count(),
      this.auditRepository
        .createQueryBuilder('audit')
        .select('AVG(audit.score)', 'avgScore')
        .addSelect('AVG(audit."storefrontScore")', 'avgStorefront')
        .getRawOne(),
      this.auditRepository
        .createQueryBuilder('audit')
        .select('audit.type', 'type')
        .addSelect('COUNT(audit.id)', 'count')
        .groupBy('audit.type')
        .getRawMany(),
    ]);
    return {
      total,
      avgScore: Math.round(Number(avgRow?.avgScore ?? 0)),
      avgStorefrontScore: Math.round(Number(avgRow?.avgStorefront ?? 0)),
      byType: (byType ?? []).map((row) => ({ type: row.type, count: Number(row.count) })),
    };
  }
}
