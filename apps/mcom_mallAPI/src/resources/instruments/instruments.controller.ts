import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { InstrumentsService } from './instruments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Instruments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get(':code')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Resolve an instrument by code',
    description:
      'Admin/support lookup. Returns the canonical kind, behaviour, balance and scope for a coupon, voucher, money wallet or gift card code.',
  })
  resolve(@Param('code') code: string) {
    return this.instrumentsService.resolve(code);
  }
}
