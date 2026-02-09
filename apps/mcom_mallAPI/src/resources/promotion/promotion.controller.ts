import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Get,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CheckPromotionDto } from './dto/check-promotion.dto';
import { PromotionSummaryStatisticsDto } from './dto/promotion-summary-statistics.dto';
import { PromotionHistoryQueryDto } from './dto/promotion-history-query.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PromotionTransactionHistoryDto } from './dto/promotion-transaction-history.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) { }

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Check for promotions' })
  check(
    @Query() checkPromotionDto: CheckPromotionDto,
    @CurrentUser() user?: User,
  ) {
    return this.promotionService.check(checkPromotionDto, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promotion' })
  create(
    @CurrentUser() user: User,
    @Body() createPromotionDto: CreatePromotionDto,
  ) {
    return this.promotionService.create(user.id, createPromotionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all of the current user's promotions" })
  findAll(@CurrentUser() user: User) {
    return this.promotionService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a promotion by id' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.promotionService.findOne(user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a promotion' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionService.update(user.id, id, updatePromotionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promotion' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.promotionService.remove(user.id, id);
  }

  @Post(':id/participate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Participate in a promotion' })
  participate(@CurrentUser() user: User, @Param('id') id: string) {
    return this.promotionService.participate(user.id, id);
  }

  @Get(':id/summary-statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get summary statistics for a promotion' })
  @ApiResponse({
    status: 200,
    description: 'The summary statistics for the promotion.',
    type: PromotionSummaryStatisticsDto,
  })
  getSummaryStatistics(@Param('id') id: string) {
    return this.promotionService.getSummaryStatistics(id);
  }

  @Get(':id/transaction-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the transaction history for a promotion' })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of promotion transactions.',
    type: PageDto<PromotionTransactionHistoryDto>,
  })
  getTransactionHistory(
    @Param('id') id: string,
    @Query() query: PromotionHistoryQueryDto,
  ) {
    return this.promotionService.getTransactionHistory(id, query);
  }
}
