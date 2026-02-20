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
import { AssetCategoryService } from './asset-category.service';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { UpdateAssetCategoryDto } from './dto/update-asset-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Gift Card Asset Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gift-card/asset-categories')
export class AssetCategoryController {
  constructor(private readonly assetCategoryService: AssetCategoryService) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new asset category' })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createDto: CreateAssetCategoryDto, @CurrentUser() user: User) {
    return this.assetCategoryService.create(createDto, user);
  }

  @Get()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get all asset categories for the current user' })
  findAll(@CurrentUser() user: User) {
    return this.assetCategoryService.findAll(user);
  }

  @Get(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get an asset category by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.assetCategoryService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update an asset category' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAssetCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.assetCategoryService.update(id, updateDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete an asset category' })
  @ApiResponse({
    status: 204,
    description: 'The category has been successfully deleted.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.assetCategoryService.remove(id, user);
  }
}
