import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GiftCardAssetService } from './gift-card-asset.service';
import { CreateGiftCardAssetDto } from './dto/create-gift-card-asset.dto';
import { UpdateGiftCardAssetDto } from './dto/update-gift-card-asset.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Gift Card Assets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.OWNER)
@Controller('gift-card-assets')
export class GiftCardAssetController {
  constructor(private readonly giftCardAssetService: GiftCardAssetService) {}

  @Post()
  create(
    @Body() createGiftCardAssetDto: CreateGiftCardAssetDto,
    @Req() req: { user: User },
  ) {
    return this.giftCardAssetService.create(createGiftCardAssetDto, req.user);
  }

  @Get()
  findAll(@Req() req: { user: User }) {
    return this.giftCardAssetService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: User }) {
    return this.giftCardAssetService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGiftCardAssetDto: UpdateGiftCardAssetDto,
    @Req() req: { user: User },
  ) {
    return this.giftCardAssetService.update(
      id,
      updateGiftCardAssetDto,
      req.user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: User }) {
    return this.giftCardAssetService.remove(id, req.user);
  }
}
