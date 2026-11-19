import {
  Controller,
  Get,
  UseGuards,
  Query,
  Patch,
  Param,
  Delete,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { AdminProductsService } from '../services/products.admin.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { ReviewModerationDto } from '../dto/moderation.dto';
import {
  ProductQueryDto,
  PaginatedProductsDto,
  ProductStatsDto,
} from '../dto/catalog.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiResponse({ status: 200, type: ProductStatsDto })
  getStats() {
    return this.adminProductsService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, type: PaginatedProductsDto })
  findAll(@Query() query: ProductQueryDto) {
    return this.adminProductsService.findAll(query);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a pending product' })
  approve(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminProductsService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a pending product' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: ReviewModerationDto,
  ) {
    return this.adminProductsService.reject(id, user.id, dto.reviewNote);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Delist a product' })
  deactivate(@Param('id') id: string) {
    return this.adminProductsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Republish a delisted product' })
  activate(@Param('id') id: string) {
    return this.adminProductsService.activate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id') id: string) {
    return this.adminProductsService.remove(id);
  }
}
