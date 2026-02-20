import {
  Controller,
  Get,
  Param,
  Query,
  UnauthorizedException,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import {
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CheckBalanceResponseDto } from './dto/check-balance-response.dto';
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto';
import { VerifyPurchaseDto } from './dto/verify-purchase.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InitiateReloadDto } from './dto/initiate-reload.dto';
import { VerifyReloadDto } from './dto/verify-reload.dto';
import { GiftCardTemplateSearchDto } from './dto/gift-card-template-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { GiftCardTemplate } from './entities/gift-card-template.entity';

@ApiTags('Gift Cards (Consumer)')
@Controller('gift-cards')
export class GiftCardConsumerController {
  constructor(private readonly giftCardService: GiftCardService) {}

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate a gift card purchase (Auth Required)' })
  @ApiBody({ type: InitiatePurchaseDto })
  async initiatePurchase(
    @Body() initiatePurchaseDto: InitiatePurchaseDto,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return this.giftCardService.initiateGiftCardPurchase(
      initiatePurchaseDto,
      userId,
    );
  }

  @Post('purchase/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify and complete a gift card purchase (Auth Required)',
  })
  @ApiBody({ type: VerifyPurchaseDto })
  async verifyPurchase(
    @Body() verifyPurchaseDto: VerifyPurchaseDto,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return this.giftCardService.verifyAndCompletePurchase(
      verifyPurchaseDto,
      userId,
    );
  }

  @Post(':code/initiate-reload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiate a gift card reload',
    description:
      'Returns a client secret for Stripe or an order ID for PayPal.',
  })
  initiateReload(
    @Param('code') code: string,
    @Body() initiateDto: InitiateReloadDto,
    @CurrentUser() user: User,
  ) {
    return this.giftCardService.initiateGiftCardReload(
      code,
      initiateDto,
      user.id,
    );
  }

  @Post(':code/verify-reload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify and complete a gift card reload after payment',
  })
  verifyReload(
    @Param('code') code: string,
    @Body() verifyDto: VerifyReloadDto,
    @CurrentUser() user: User,
  ) {
    return this.giftCardService.verifyAndCompleteReload(
      code,
      verifyDto,
      user.id,
    );
  }

  @Get('my-purchases')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all gift cards purchased by the authenticated user',
  })
  async getMyPurchasedCards(@Req() req: Request) {
    const userId = req.user.id;
    return this.giftCardService.findMyPurchasedCards(userId);
  }

  @Public()
  @Get('templates/business/:businessId')
  @ApiOperation({
    summary: 'Get available gift card templates for a business',
  })
  @ApiParam({
    name: 'businessId',
    description: 'The ID of the business',
    type: 'string',
  })
  async getPublicTemplates(@Param('businessId') businessId: string) {
    return this.giftCardService.getPublicTemplates(businessId);
  }

  @Get('templates/public')
  @Public()
  @ApiOperation({
    summary: 'Get all public gift card templates with pagination and search',
  })
  async findAllPublicTemplates(
    @Query() searchDto: GiftCardTemplateSearchDto,
  ): Promise<PageDto<GiftCardTemplate>> {
    return this.giftCardService.findAllPublicTemplates(searchDto);
  }

  @Get('balance/:code')
  @Public()
  @ApiOperation({ summary: 'Check the balance of a gift card' })
  @ApiParam({
    name: 'code',
    description: 'The unique 16-character gift card code',
    type: 'string',
  })
  async checkBalance(
    @Param('code') code: string,
  ): Promise<CheckBalanceResponseDto> {
    return this.giftCardService.checkBalance(code);
  }

  @Get(':code/history')
  @Public()
  @ApiOperation({ summary: 'Get the transaction history of a gift card' })
  @ApiParam({
    name: 'code',
    description: 'The unique 16-character gift card code',
    type: 'string',
  })
  async getTransactionHistory(@Param('code') code: string) {
    return this.giftCardService.getTransactionHistory(code);
  }

  @Get('delivery/process')
  @Public()
  @ApiOperation({
    summary:
      'Process scheduled gift card deliveries (to be called by a cron job)',
  })
  async processScheduledDeliveries(@Query('secret') secret: string) {
    // In a real app, this secret would come from environment variables
    // and be compared securely.
    const CRON_SECRET = 'your-super-secret-cron-key';
    if (secret !== CRON_SECRET) {
      throw new UnauthorizedException('Invalid secret');
    }
    return this.giftCardService.processScheduledDeliveries();
  }
}
