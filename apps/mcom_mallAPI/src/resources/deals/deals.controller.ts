import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DealsService } from './deals.service';
import { GetDealsQueryDto } from './dto/get-deals-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Deals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Discover active deals',
    description:
      'Unified list of active coupons, reward definitions, campaigns and gift-card templates.',
  })
  getAll(@Query() query: GetDealsQueryDto) {
    return this.dealsService.getAll(query);
  }

  @Get('mine')
  @ApiBearerAuth()
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'My deals',
    description:
      'The authenticated user’s coupons, money wallets, vouchers and gift cards in one shape.',
  })
  getMine(@CurrentUser() user: User, @Query() query: GetDealsQueryDto) {
    return this.dealsService.getMine(user.id, query);
  }

  @Get('resolve/:code')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Resolve a deal by code',
    description:
      'Admin/support lookup across every ledger: returns the deal shape for a coupon, voucher, money wallet or gift card code.',
  })
  resolve(@Param('code') code: string) {
    return this.dealsService.resolve(code);
  }
}
