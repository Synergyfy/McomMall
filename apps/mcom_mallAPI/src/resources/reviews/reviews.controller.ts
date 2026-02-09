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
import { ReviewStatus } from './entities/review.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAdmin(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: ReviewStatus,
  ) {
    return this.reviewsService.findAllAdmin({ ...paginationQuery, status });
  }

  @Patch('admin/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  publish(@Param('id') id: string) {
    return this.reviewsService.publish(id);
  }

  @Patch('admin/:id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  unpublish(@Param('id') id: string) {
    return this.reviewsService.unpublish(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('user/:userId')
  findUserReviews(@Param('userId') userId: string, @Request() req) {
    return this.reviewsService.findUserReviews(userId, req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('business/:businessId')
  findBusinessReviews(@Param('businessId') businessId: string, @Request() req) {
    return this.reviewsService.findBusinessReviews(businessId, req.user);
  }
}
