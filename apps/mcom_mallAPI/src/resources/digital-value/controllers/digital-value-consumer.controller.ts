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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DigitalValueService } from '../digital-value.service';
import { CreateDigitalValueDto } from '../dto/create-digital-value.dto';
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
  @ApiOperation({ summary: 'Get my digital value instruments' })
  getMyInstruments(@Req() req) {
    return this.digitalValueService.getByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a digital value instrument' })
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
  })
  async getTransactions(@Param('id') id: string, @Req() req) {
    const instrument = await this.digitalValueService.getById(id);
    if (instrument.owner.id !== req.user.id) {
      throw new ForbiddenException('You do not own this instrument');
    }
    return this.digitalValueService.getTransactions(id);
  }

  @Post(':id/fund')
  @ApiOperation({ summary: 'Fund or top-up a digital value instrument' })
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
  @ApiOperation({ summary: 'Link a digital value instrument to a merchant' })
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
