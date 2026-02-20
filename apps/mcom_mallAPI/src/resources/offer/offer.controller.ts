import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApplyOfferDto } from './dto/apply-offer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('offer')
@UseGuards(JwtAuthGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post('apply')
  applyOffer(
    @CurrentUser() user: User,
    @Body() applyOfferDto: ApplyOfferDto,
  ) {
    return this.offerService.applyOffer(user.id, applyOfferDto);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() createOfferDto: CreateOfferDto) {
    return this.offerService.create(user, createOfferDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.offerService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.offerService.findOne(user.id, id);
  }

  @Get(':id/transactions')
  getOfferTransactions(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.offerService.getOfferTransactions(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offerService.update(id, updateOfferDto, user);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.offerService.remove(user.id, id);
  }
}
