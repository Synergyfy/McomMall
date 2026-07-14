import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GoogleBusinessService,
  CompleteOnboardingDto,
} from './google-business.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('GoogleBusiness')
@Controller('google-business')
export class GoogleBusinessController {
  constructor(private readonly googleBusinessService: GoogleBusinessService) {}

  @Public()
  @Get('branches')
  @ApiOperation({ summary: 'Get Google Business Profile storefront branches' })
  @ApiResponse({ status: 200, description: 'Return branches.' })
  async getBranches(@Query('email') email: string) {
    return this.googleBusinessService.getBranches(email);
  }

  @Public()
  @Get('map-category')
  @ApiOperation({
    summary: 'Translate a Google Category ID to internal taxonomy',
  })
  @ApiResponse({ status: 200, description: 'Return mapped taxonomy IDs.' })
  async mapCategory(@Query('googleCategoryId') googleCategoryId: string) {
    return this.googleBusinessService.mapGoogleCategory(googleCategoryId);
  }

  @Public()
  @Post('complete-onboarding')
  @ApiOperation({
    summary:
      'Atomically claims a branch, creates a merchant account, and sets up storefront',
  })
  @ApiResponse({
    status: 201,
    description: 'Onboarding completed successfully.',
  })
  async completeOnboarding(
    @Body() completeOnboardingDto: CompleteOnboardingDto,
  ) {
    return this.googleBusinessService.completeOnboarding(completeOnboardingDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login via Google SSO (handles both mock and real)',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async googleLogin(@Body('email') body: { email: string }) {
    return this.googleBusinessService.googleLogin(body.email);
  }
}
