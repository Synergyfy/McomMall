import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerDirectoryService } from './customer-directory.service';
import {
  CreateCustomerSegmentDto,
  UpdateCustomerSegmentDto,
} from './dto/customer-segment.dto';

@ApiTags('Customer Directory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerDirectoryController {
  constructor(
    private readonly customerDirectoryService: CustomerDirectoryService,
  ) {}

  @Get('directory')
  @ApiOperation({
    summary: 'List engaged customers for a business with filtering',
  })
  async getDirectory(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('segment') segment?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.customerDirectoryService.getDirectory(businessId, {
      search,
      category: category as any,
      segment,
      limit,
      offset,
    });
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Get recent customer activity feed for a business',
  })
  async getActivityFeed(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.customerDirectoryService.getActivityFeed(businessId, limit);
  }

  @Get('segments')
  @ApiOperation({ summary: 'List customer segments for a business' })
  async findAllSegments(
    @Query('businessId', ParseUUIDPipe) businessId: string,
  ) {
    return this.customerDirectoryService.findAllSegments(businessId);
  }

  @Post('segments')
  @ApiOperation({ summary: 'Create a customer segment' })
  createSegment(@Body() dto: CreateCustomerSegmentDto) {
    return this.customerDirectoryService.createSegment(dto);
  }

  @Patch('segments/:id')
  @ApiOperation({ summary: 'Update a customer segment' })
  updateSegment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerSegmentDto,
  ) {
    return this.customerDirectoryService.updateSegment(id, dto);
  }

  @Delete('segments/:id')
  @ApiOperation({ summary: 'Delete a customer segment' })
  removeSegment(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerDirectoryService.removeSegment(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer 360 detail view' })
  @ApiParam({ name: 'id', description: 'Customer (user) UUID' })
  @ApiResponse({ status: 200, description: 'Customer detail retrieved' })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  async getCustomerDetail(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customerDirectoryService.getCustomerDetail(businessId, id);
  }
}
