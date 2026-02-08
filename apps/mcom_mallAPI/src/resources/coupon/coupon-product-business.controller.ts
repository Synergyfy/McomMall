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
import { CouponProductService } from './coupon-product.service';
import { CreateCouponProductDto } from './dto/create-coupon-product.dto';
import { UpdateCouponProductDto } from './dto/update-coupon-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { AuthenticatedRequest } from '../../common/types';

@Controller('business/coupon-products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class CouponProductBusinessController {
  constructor(private readonly couponProductService: CouponProductService) {}

  @Post()
  create(
    @Body() createCouponProductDto: CreateCouponProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponProductService.create(createCouponProductDto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.couponProductService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.couponProductService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCouponProductDto: UpdateCouponProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.couponProductService.update(id, updateCouponProductDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.couponProductService.remove(id, req.user);
  }
}