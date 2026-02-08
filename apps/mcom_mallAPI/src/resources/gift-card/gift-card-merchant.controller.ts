import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateGiftCardTemplateDto } from './dto/create-gift-card-template.dto';
import { UpdateGiftCardTemplateDto } from './dto/update-gift-card-template.dto';
import { UpdateGiftCardSettingsDto } from './dto/update-gift-card-settings.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BulkCreateGiftCardDto } from './dto/bulk-create-gift-card.dto';
import { BulkImportGiftCardsDto } from './dto/bulk-import-gift-cards.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PageDto } from '../../common/dto/page.dto';
import { GiftCard } from './entities/gift-card.entity';

@ApiTags('Gift Cards (Merchant)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('merchant/gift-cards')
export class GiftCardMerchantController {
  constructor(private readonly giftCardService: GiftCardService) {}

  // --- Settings Management ---
  @Get('settings')
  @ApiOperation({ summary: "Get the owner's gift card settings" })
  getSettings(@CurrentUser() user: User) {
    return this.giftCardService.getSettings(user.id);
  }

  @Put('settings')
  @ApiOperation({ summary: "Update the owner's gift card settings" })
  updateSettings(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateGiftCardSettingsDto,
  ) {
    return this.giftCardService.updateSettings(user.id, updateDto);
  }

  // --- Template Management ---
  @Post('templates')
  @ApiOperation({ 
    summary: 'Create a new gift card template',
    description: 'Creates a new template for gift cards. This action is subject to tier-based capability checks (quota limits on the number of templates). Requires an active membership.'
  })
  @ApiOkResponse({ description: 'The created gift card template.', type: CreateGiftCardTemplateDto }) // Note: Returns Entity, but usually we doc DTO or Entity if exposed
  @ApiResponse({ status: 403, description: 'Forbidden. Quota exceeded or membership issue.' })
  createTemplate(
    @CurrentUser() user: User,
    @Body() createDto: CreateGiftCardTemplateDto,
  ) {
    return this.giftCardService.createTemplate(createDto, user.id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List all gift card templates for the owner' })
  findAllTemplates(@CurrentUser() user: User) {
    return this.giftCardService.findAllTemplatesForOwner(user.id);
  }

  @Get('templates/:id/assets')
  @ApiOperation({
    summary:
      "Get all of a user's assets, based on the owner of a given template",
  })
  findAssetsByTemplate(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.giftCardService.findAssetsByTemplateId(id, user.id);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a single gift card template by ID' })
  findTemplateById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.giftCardService.findTemplateByIdForOwner(id, user.id);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update a gift card template' })
  updateTemplate(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateDto: UpdateGiftCardTemplateDto,
  ) {
    return this.giftCardService.updateTemplate(id, updateDto, user.id);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a gift card template' })
  deleteTemplate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.giftCardService.deleteTemplate(id, user.id);
  }

  // --- Gift Card Instance Management ---
  @Get()
  @ApiOperation({ summary: 'List all issued gift cards for the owner' })
  @ApiOkResponse({
    description: 'A paginated list of gift cards.',
    type: PageDto,
  })
  findAll(
    @CurrentUser() user: User,
    @Query() paginationQueryDto: PaginationQueryDto,
    @Query('search') search?: string,
  ): Promise<PageDto<GiftCard>> {
    return this.giftCardService.findAllGiftCardsForOwner(
      user.id,
      paginationQueryDto,
      search,
    );
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create a batch of gift cards' })
  bulkCreate(
    @CurrentUser() user: User,
    @Body() bulkCreateDto: BulkCreateGiftCardDto,
  ) {
    return this.giftCardService.bulkCreateGiftCards(bulkCreateDto, user.id);
  }

  @Post('import/json')
  @ApiOperation({
    summary: 'Import gift cards from a JSON payload',
    description:
      'Send an array of gift card objects to bulk create them. This is intended to be used after parsing a CSV on the client-side.',
  })
  importFromJson(
    @Body() bulkImportDto: BulkImportGiftCardsDto,
    @CurrentUser() user: User,
    @Query('templateId') templateId: string,
  ) {
    if (!templateId) {
      throw new BadRequestException('templateId query parameter is required.');
    }
    return this.giftCardService.importGiftCardsFromJson(
      bulkImportDto.giftCards,
      user.id,
      templateId,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats for gift cards' })
  getStats(@CurrentUser() user: User) {
    return this.giftCardService.getOwnerStats(user.id);
  }

  @Get('chart-data')
  @ApiOperation({ summary: 'Get monthly sales vs redemptions data for charts' })
  getChartData(@CurrentUser() user: User) {
    return this.giftCardService.getSalesVsRedemptionsChartData(user.id);
  }

  @Get('summary-statistics')
  @ApiOperation({ summary: 'Get summary statistics for gift cards' })
  getSummaryStatistics(@CurrentUser() user: User) {
    return this.giftCardService.getSummaryStatistics(user.id);
  }

  @Get('sales-and-redemptions')
  @ApiOperation({
    summary: 'Get a detailed transaction history for a given time range',
  })
  getTransactions(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.giftCardService.getTransactionHistoryForOwner(
      user.id,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific gift card' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.giftCardService.findGiftCardDetailsForOwner(id, user.id);
  }

  @Post(':id/adjust-balance')
  @ApiOperation({ summary: 'Manually adjust the balance of a gift card' })
  adjustBalance(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() adjustDto: AdjustBalanceDto,
  ) {
    return this.giftCardService.adjustBalance(
      id,
      user.id,
      adjustDto.amount,
      adjustDto.notes,
      user.id,
    );
  }

  @Post(':id/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Resend the gift card email to the recipient' })
  resendEmail(@Param('id') id: string, @CurrentUser() user: User) {
    return this.giftCardService.resendGiftCardEmail(id, user.id);
  }

  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel (deactivate) a gift card' })
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.giftCardService.cancelGiftCard(id, user.id);
  }
}
