import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Review, ReviewStatus } from './entities/review.entity';
import { PageDto } from '../../common/dto/page.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review successfully created.', type: Review })
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'Return all reviews.', type: [Review] })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all reviews (paginated)' })
  @ApiResponse({ status: 200, description: 'Return paginated reviews.', type: PageDto })
  @ApiQuery({ name: 'status', enum: ReviewStatus, required: false })
  findAllAdmin(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: ReviewStatus,
  ) {
    return this.reviewsService.findAllAdmin({ ...paginationQuery, status });
  }

  @Patch('admin/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Publish a review' })
  @ApiResponse({ status: 200, description: 'Review published.', type: Review })
  publish(@Param('id') id: string) {
    return this.reviewsService.publish(id);
  }

  @Patch('admin/:id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Unpublish a review' })
  @ApiResponse({ status: 200, description: 'Review unpublished.', type: Review })
  unpublish(@Param('id') id: string) {
    return this.reviewsService.unpublish(id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a review by id' })
  @ApiResponse({ status: 200, description: 'Return the review.', type: Review })
  findOne(@Param('id') id: string, @Request() req) {
    return this.reviewsService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review successfully updated.', type: Review })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(id, updateReviewDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews by user' })
  @ApiResponse({ status: 200, description: 'Return user reviews.', type: [Review] })
  findUserReviews(@Param('userId') userId: string, @Request() req) {
    return this.reviewsService.findUserReviews(userId, req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('business/:businessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews by business' })
  @ApiResponse({ status: 200, description: 'Return business reviews.', type: [Review] })
  findBusinessReviews(@Param('businessId') businessId: string, @Request() req) {
    return this.reviewsService.findBusinessReviews(businessId, req.user);
  }
}
