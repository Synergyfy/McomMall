import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CapabilityService, ActionType } from './capability.service';
import { Request } from 'express';

@ApiTags('Capability')
@ApiBearerAuth()
@Controller('capability')
export class CapabilityController {
  constructor(private readonly capabilityService: CapabilityService) {}

  @Get('check')
  @ApiOperation({ summary: 'Check if the current user has permission for a specific action' })
  @ApiQuery({ name: 'action', enum: ActionType, description: 'The action to check permission for' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns success if allowed, or throws ForbiddenException if not.',
    schema: {
        example: { status: 'allowed' }
    }
  })
  async check(@Query('action') action: ActionType, @Req() req: Request) {
    await this.capabilityService.checkPermission(req.user['id'], action);
    return { status: 'allowed' };
  }

  @Get('effective-config')
  @ApiOperation({ summary: 'Get the effective tier configuration for the current user (paid membership or active trial)' })
  @ApiResponse({
    status: 200,
    description: 'The merged/effective configuration',
    schema: {
        example: {
            quotas: {
                maxListings: 100,
                allowProductListing: true,
                maxProducts: 50,
                maxGiftCardTemplates: 5
            },
            featureFlags: {
                advancedAnalytics: true,
                allowCustomBranding: false
            }
        }
    }
  })
  async getEffectiveConfig(@Req() req: Request) {
    return this.capabilityService.getEffectiveConfig(req.user['id']);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get a summary of what the owner has used out of their tier capability' })
  @ApiResponse({
    status: 200,
    description: 'Usage summary including used, limit, and remaining quotas',
    schema: {
        example: {
            hasAccess: true,
            quotas: {
                listings: { used: 1, limit: 3, remaining: 2 },
                products: { used: 0, limit: 5, remaining: 5, allowed: true },
                giftCardTemplates: { used: 1, limit: 1, remaining: 0 },
                couponTemplates: { used: 2, limit: 5, remaining: 3 },
                loyaltyPrograms: { used: 0, limit: 1, remaining: 1 }
            },
            features: {
                advancedAnalytics: false,
                allowCustomBranding: false,
                allowGroupCreation: false
            }
        }
    }
  })
  async getUsage(@Req() req: Request) {
    return this.capabilityService.getUsageSummary(req.user['id']);
  }
}
