import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DigitalValueService } from '../digital-value.service';
import { RedeemDigitalValueDto } from '../dto/redeem-digital-value.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../../common/role.enum';

@ApiTags('Digital Value - Business')
@ApiBearerAuth()
@Controller('digital-value/business')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER)
export class DigitalValueBusinessController {
  constructor(private readonly digitalValueService: DigitalValueService) {}

  @Get('merchant/:merchantId/instruments')
  @ApiOperation({ summary: 'Get instruments linked to this merchant' })
  async getMerchantInstruments(
    @Param('merchantId') merchantId: string,
    @Req() req,
  ) {
    await this.digitalValueService.validateMerchantOwnership(
      merchantId,
      req.user.id,
    );
    return this.digitalValueService.getByMerchant(merchantId);
  }

  @Get('merchant/:merchantId/transactions')
  @ApiOperation({
    summary: 'Get transactions for instruments linked to this merchant',
  })
  async getMerchantTransactions(
    @Param('merchantId') merchantId: string,
    @Req() req,
  ) {
    await this.digitalValueService.validateMerchantOwnership(
      merchantId,
      req.user.id,
    );
    return this.digitalValueService.getTransactionsByMerchant(merchantId);
  }

  @Post('merchant/:merchantId/redeem/:id')
  @ApiOperation({ summary: 'Redeem a customer instrument at this merchant' })
  async redeemCustomerInstrument(
    @Param('merchantId') merchantId: string,
    @Param('id') id: string,
    @Body() redeemDto: RedeemDigitalValueDto,
    @Req() req,
  ) {
    await this.digitalValueService.validateMerchantOwnership(
      merchantId,
      req.user.id,
    );

    if (redeemDto.merchantId && redeemDto.merchantId !== merchantId) {
      throw new BadRequestException(
        'Merchant ID in body must match URL parameter',
      );
    }

    // Ensure merchantId is set correctly for redemption context
    redeemDto.merchantId = merchantId;

    return this.digitalValueService.redeem(id, redeemDto);
  }
}
