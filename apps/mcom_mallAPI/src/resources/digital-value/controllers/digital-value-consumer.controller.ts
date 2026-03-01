import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { DigitalValueService } from '../digital-value.service';
import { FundDigitalValueDto } from '../dto/fund-digital-value.dto';
import { LinkMerchantDto } from '../dto/link-merchant.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../../common/role.enum';

@ApiTags('Digital Value - Consumer')
@ApiBearerAuth()
@Controller('digital-value/consumer')
@UseGuards(RolesGuard)
@Roles(UserRole.CUSTOMER)
export class DigitalValueConsumerController {
  constructor(private readonly digitalValueService: DigitalValueService) {}

  @Get()
  @ApiOperation({
    summary: 'Get my digital value instruments',
    description:
      'Retrieves all gift cards and vouchers owned by the authenticated customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of digital value instruments returned successfully.',
  })
  getMyInstruments(@Req() req) {
    return this.digitalValueService.getByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get details of a digital value instrument',
    description:
      'Retrieves details for a specific instrument. User must be the owner.',
  })
  @ApiResponse({ status: 200, description: 'Instrument details returned.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not own this instrument.',
  })
  @ApiResponse({ status: 404, description: 'Instrument not found.' })
  async getInstrument(@Param('id') id: string, @Req() req) {
    const instrument = await this.digitalValueService.getById(id);
    if (instrument.owner.id !== req.user.id) {
      throw new ForbiddenException('You do not own this instrument');
    }
    return instrument;
  }

  @Get(':id/transactions')
  @ApiOperation({
    summary: 'Get transaction history of a digital value instrument',
    description:
      'Retrieves funding and redemption history for a specific instrument.',
  })
  @ApiResponse({ status: 200, description: 'Transaction history returned.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not own this instrument.',
  })
  async getTransactions(@Param('id') id: string, @Req() req) {
    const instrument = await this.digitalValueService.getById(id);
    if (instrument.owner.id !== req.user.id) {
      throw new ForbiddenException('You do not own this instrument');
    }
    return this.digitalValueService.getTransactions(id);
  }

  @Post(':id/fund')
  @ApiOperation({
    summary: 'Fund or top-up a digital value instrument',
    description:
      'Adds funds to an existing instrument. Requires payment verification (omitted for brevity in this engine, usually called via webhook).',
  })
  @ApiResponse({
    status: 200,
    description: 'Funding successful. Returns updated instrument.',
  })
  async fund(
    @Param('id') id: string,
    @Body() fundDto: FundDigitalValueDto,
    @Req() req,
  ) {
    // Check ownership before funding? Usually yes.
    const instrument = await this.digitalValueService.getById(id);
    if (instrument.owner.id !== req.user.id) {
      throw new ForbiddenException('You do not own this instrument');
    }
    return this.digitalValueService.fund(id, fundDto);
  }

  @Post(':id/link')
  @ApiOperation({
    summary: 'Link a digital value instrument to a merchant',
    description:
      'Permanently assigns a general instrument to a specific merchant.',
  })
  @ApiResponse({ status: 200, description: 'Instrument linked successfully.' })
  linkMerchant(
    @Param('id') id: string,
    @Body() linkDto: LinkMerchantDto,
    @Req() req,
  ) {
    return this.digitalValueService.linkMerchant(
      id,
      linkDto.merchantId,
      req.user.id,
    );
  }
}
