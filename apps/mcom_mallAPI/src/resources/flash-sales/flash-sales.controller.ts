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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { FlashSalesService } from './flash-sales.service';
import { FlashSaleItem } from './entities/flash-sale-item.entity';
import { CreateFlashSaleItemDto } from './dto/create-flash-sale-item.dto';
import { UpdateFlashSaleItemDto } from './dto/update-flash-sale-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Flash Sales')
@Controller('flash-sales')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List all active flash sale items',
    description:
      'Returns flash sale items currently active with a countdown until they expire. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active flash sale items retrieved successfully',
    type: [FlashSaleItem],
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected database error',
  })
  findAllActive(): Promise<FlashSaleItem[]> {
    return this.flashSalesService.findAllActive();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a flash sale item by ID' })
  @ApiParam({ name: 'id', description: 'Flash sale item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Flash sale item retrieved successfully',
    type: FlashSaleItem,
  })
  @ApiNotFoundResponse({
    description: 'Flash sale item with specified ID was not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FlashSaleItem> {
    return this.flashSalesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new flash sale item' })
  @ApiResponse({
    status: 201,
    description: 'Flash sale item created successfully',
    type: FlashSaleItem,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input payload or startDate after endDate',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  create(@Body() dto: CreateFlashSaleItemDto): Promise<FlashSaleItem> {
    return this.flashSalesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing flash sale item' })
  @ApiParam({ name: 'id', description: 'Flash sale item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Flash sale item updated successfully',
    type: FlashSaleItem,
  })
  @ApiNotFoundResponse({
    description: 'Flash sale item with specified ID was not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFlashSaleItemDto,
  ): Promise<FlashSaleItem> {
    return this.flashSalesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a flash sale item' })
  @ApiParam({ name: 'id', description: 'Flash sale item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Flash sale item deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Flash sale item with specified ID was not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.flashSalesService.remove(id);
  }
}
