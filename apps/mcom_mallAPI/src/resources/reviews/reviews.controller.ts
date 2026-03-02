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
  Put,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Review, ReviewStatus } from './entities/review.entity';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'Review successfully created.',
    type: Review,
  })
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({
    status: 200,
    description: 'Return all reviews.',
    type: [Review],
  })
  findAll() {
    return this.reviewsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  @ApiOperation({ summary: 'Admin: Get all reviews (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated reviews.',
  })
  @ApiQuery({ name: 'status', enum: ReviewStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAllAdmin(
    @Query('status') status?: ReviewStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.findAllAdmin({ status, page, limit });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/publish')
  @ApiOperation({ summary: 'Admin: Publish a review' })
  @ApiResponse({ status: 200, description: 'Review published.', type: Review })
  publish(@Param('id') id: string) {
    return this.reviewsService.publish(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/unpublish')
  @ApiOperation({ summary: 'Admin: Unpublish a review' })
  @ApiResponse({
    status: 200,
    description: 'Review unpublished.',
    type: Review,
  })
  unpublish(@Param('id') id: string) {
    return this.reviewsService.unpublish(id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a review by id' })
  @ApiResponse({ status: 200, description: 'Return the review.', type: Review })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({
    status: 200,
    description: 'Review successfully updated.',
    type: Review,
  })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(id, updateReviewDto, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review successfully deleted.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reviews by user' })
  @ApiResponse({
    status: 200,
    description: 'Return user reviews.',
    type: [Review],
  })
  findUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.findUserReviews(userId);
  }

  @Public()
  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get reviews by business' })
  @ApiResponse({
    status: 200,
    description: 'Return business reviews.',
    type: [Review],
  })
  findBusinessReviews(@Param('businessId') businessId: string) {
    return this.reviewsService.findBusinessReviews(businessId);
  }

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews by product' })
  @ApiResponse({
    status: 200,
    description: 'Return product reviews.',
    type: [Review],
  })
  findProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.findProductReviews(productId);
  }

  @Public()
  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Get reviews by service' })
  @ApiResponse({
    status: 200,
    description: 'Return service reviews.',
    type: [Review],
  })
  findServiceReviews(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findServiceReviews(serviceId);
  }
}
