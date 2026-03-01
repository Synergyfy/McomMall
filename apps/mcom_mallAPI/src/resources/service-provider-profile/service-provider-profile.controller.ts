import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { ServiceProviderProfileService } from './service-provider-profile.service';
import { CreateServiceProviderProfileDto } from './dto/create-service-provider-profile.dto';
import { UpdateServiceProviderProfileDto } from './dto/update-service-provider-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiceProviderProfile } from './entities/service-provider-profile.entity';

@ApiTags('Service Provider Profiles')
@Controller('service-provider-profiles')
export class ServiceProviderProfileController {
  constructor(private readonly profileService: ServiceProviderProfileService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a service provider profile' })
  @ApiResponse({
    status: 201,
    description: 'The profile has been successfully created.',
    type: ServiceProviderProfile,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createDto: CreateServiceProviderProfileDto,
    @CurrentUser() user: User,
  ): Promise<ServiceProviderProfile> {
    return this.profileService.create(createDto, user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's service provider profile" })
  @ApiResponse({
    status: 200,
    description: 'The service provider profile.',
    type: ServiceProviderProfile,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  findMyProfile(@CurrentUser() user: User): Promise<ServiceProviderProfile> {
    return this.profileService.findMyProfile(user);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a service provider profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'The service provider profile.',
    type: ServiceProviderProfile,
  })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  findByUserId(
    @Param('userId') userId: string,
  ): Promise<ServiceProviderProfile> {
    return this.profileService.findByUserId(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update the current user's service provider profile",
  })
  @ApiResponse({
    status: 200,
    description: 'The profile has been successfully updated.',
    type: ServiceProviderProfile,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  update(
    @Body() updateDto: UpdateServiceProviderProfileDto,
    @CurrentUser() user: User,
  ): Promise<ServiceProviderProfile> {
    return this.profileService.update(updateDto, user);
  }
}
