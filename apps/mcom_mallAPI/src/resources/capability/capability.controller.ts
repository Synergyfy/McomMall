import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CapabilityService, ActionType } from './capability.service';
import { Request } from 'express';
import { CapabilityUsageDto } from './dto/capability-usage.dto';

@ApiTags('Capability')
@ApiBearerAuth()
@Controller('capability')
export class CapabilityController {
  constructor(private readonly capabilityService: CapabilityService) {}

  @Get('check')
  @ApiOperation({
    summary: 'Check if the current user has permission for a specific action',
  })
  @ApiQuery({
    name: 'action',
    enum: ActionType,
    description: 'The action to check permission for',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns success if allowed, or throws ForbiddenException if not.',
    schema: {
      example: { status: 'allowed' },
    },
  })
  async check(@Query('action') action: ActionType, @Req() req: Request) {
    await this.capabilityService.checkPermission(req.user['id'], action);
    return { status: 'allowed' };
  }

  @Get('effective-config')
  @ApiOperation({
    summary:
      'Get the effective tier configuration for the current user (paid membership or active trial)',
  })
  @ApiResponse({
    status: 200,
    description:
      'The merged/effective configuration of quotas and feature flags.',
    schema: {
      example: {
        quotas: {
          maxListings: 100,
          allowProductListing: true,
          maxProducts: 50,
          maxServices: 50,
          maxGiftCardTemplates: 5,
          maxCouponTemplates: 10,
          maxLoyaltyPrograms: 1,
          maxImagesPerListing: 5,
          featuredListingAllowance: 2,
        },
        featureFlags: {
          priorityInSearch: true,
          advancedAnalytics: true,
          dedicatedSupport: true,
          allowCustomBranding: false,
          allowGroupCreation: true,
        },
      },
    },
  })
  async getEffectiveConfig(@Req() req: Request) {
    return this.capabilityService.getEffectiveConfig(req.user['id']);
  }

  @Get('usage')
  @ApiOperation({
    summary:
      'Get a summary of what the owner has used out of their tier capability',
  })
  @ApiResponse({
    status: 200,
    description:
      'Detailed usage summary including used, limit, and remaining quotas per resource.',
    type: CapabilityUsageDto,
  })
  async getUsage(@Req() req: Request) {
    return this.capabilityService.getUsageSummary(req.user['id']);
  }
}
