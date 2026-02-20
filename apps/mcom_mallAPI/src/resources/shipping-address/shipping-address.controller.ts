import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ShippingAddressService } from './shipping-address.service';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Shipping Address')
@ApiBearerAuth()
@Controller('shipping-address')
export class ShippingAddressController {
  constructor(private readonly shippingAddressService: ShippingAddressService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new shipping address' })
  create(@CurrentUser() user: User, @Body() createDto: CreateShippingAddressDto) {
    return this.shippingAddressService.create(user, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipping addresses (paginated)' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.shippingAddressService.findAll(user.id, page, limit);
  }

  @Get('main')
  @ApiOperation({ summary: 'Get the main shipping address' })
  findMain(@CurrentUser() user: User) {
      return this.shippingAddressService.findMain(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific shipping address' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.shippingAddressService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shipping address' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateShippingAddressDto,
  ) {
    return this.shippingAddressService.update(user.id, id, updateDto);
  }

  @Patch(':id/set-main')
  @ApiOperation({ summary: 'Set an address as the main shipping address' })
  setMain(@CurrentUser() user: User, @Param('id') id: string) {
    return this.shippingAddressService.setMain(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shipping address' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.shippingAddressService.remove(user.id, id);
  }
}
