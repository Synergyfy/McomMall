import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Gamification } from './entities/gamification.entity';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminGamificationController {
  constructor(
    @InjectRepository(Gamification)
    private readonly gameRepository: Repository<Gamification>,
  ) {}

  @Get('all')
  @ApiOperation({ summary: 'List all gamification campaigns platform-wide (Admin only)' })
  @ApiOkResponse({ description: 'Game list', type: [Gamification] })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  findAll(@Query('status') status?: string): Promise<Gamification[]> {
    return this.gameRepository.find({
      where: status ? { status } : {},
      relations: ['business'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get platform-wide gamification totals (Admin only)' })
  @ApiOkResponse({ description: 'Gamification summary' })
  async getSummary(): Promise<{
    totalGames: number;
    activeGames: number;
    totalParticipants: number;
    gamesPlayed: number;
    rewardsIssued: number;
    rewardsClaimed: number;
  }> {
    const [totalGames, activeGames, sums] = await Promise.all([
      this.gameRepository.count(),
      this.gameRepository.count({ where: { status: 'active' } }),
      this.gameRepository
        .createQueryBuilder('game')
        .select('COALESCE(SUM(game.totalParticipants), 0)', 'participants')
        .addSelect('COALESCE(SUM(game.gamesPlayed), 0)', 'played')
        .addSelect('COALESCE(SUM(game.rewardsIssued), 0)', 'issued')
        .addSelect('COALESCE(SUM(game.rewardsClaimed), 0)', 'claimed')
        .getRawOne(),
    ]);
    return {
      totalGames,
      activeGames,
      totalParticipants: Number(sums?.participants ?? 0),
      gamesPlayed: Number(sums?.played ?? 0),
      rewardsIssued: Number(sums?.issued ?? 0),
      rewardsClaimed: Number(sums?.claimed ?? 0),
    };
  }
}
