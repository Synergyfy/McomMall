import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { TierService } from './tier.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { McomSolutionAuthGuard } from '../../common/guards/mcom-solution-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Tier } from './entities/tier.entity';
import { PlansService } from '../plans/services/plans.service';
import { PlanTier } from '../plans/enums/plan-tier.enum';

@ApiTags('MCOM Solution - Plans')
@Public()
@Controller('system/plans')
@UseGuards(McomSolutionAuthGuard)
export class SystemPlanController {
  private readonly logger = new Logger(SystemPlanController.name);

  constructor(
    private readonly tierService: TierService,
    private readonly plansService: PlansService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a plan (MCOM Solution Admin)',
    description:
      'Creates a new subscription plan. Only authorized MCOM Solution requests can perform this action.',
  })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully.',
    type: Tier,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing API key.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Plan with this name already exists.',
  })
  create(@Body() createTierDto: CreateTierDto) {
    return this.tierService.create(createTierDto);
  }

  @Get('schema')
  @ApiOperation({
    summary: 'Get plan configuration schema',
    description:
      'Returns the quotas and feature flags schema supported by MCOM Mall.',
  })
  getSchema() {
    return {
      quotas: {
        maxListings: {
          type: 'number',
          description: 'Maximum listings allowed (-1 for unlimited)',
        },
        allowProductListing: {
          type: 'boolean',
          description: 'Whether product listings are allowed',
        },
        allowServiceListing: {
          type: 'boolean',
          description: 'Whether service listings are allowed',
        },
        maxProducts: {
          type: 'number',
          description: 'Maximum products allowed (-1 for unlimited)',
        },
        maxServices: {
          type: 'number',
          description: 'Maximum services allowed (-1 for unlimited)',
        },
        maxGiftCardTemplates: {
          type: 'number',
          description: 'Maximum gift card templates allowed (-1 for unlimited)',
        },
        maxCouponTemplates: {
          type: 'number',
          description: 'Maximum coupon templates allowed (-1 for unlimited)',
        },
        maxLoyaltyPrograms: {
          type: 'number',
          description: 'Maximum loyalty programs allowed (-1 for unlimited)',
        },
        maxImagesPerListing: {
          type: 'number',
          description: 'Maximum images allowed per listing',
        },
        featuredListingAllowance: {
          type: 'number',
          description: 'Number of active featured listing slots',
        },
      },
      featureFlags: {
        priorityInSearch: {
          type: 'boolean',
          description: 'Priority rotator in search results',
        },
        advancedAnalytics: {
          type: 'boolean',
          description: 'Access to advanced analytics CRM',
        },
        dedicatedSupport: {
          type: 'boolean',
          description: 'Access to dedicated account support',
        },
        allowCustomBranding: {
          type: 'boolean',
          description: 'Custom branding and storefront styling',
        },
        allowGroupCreation: {
          type: 'boolean',
          description: 'Group creation and circle automations',
        },
      },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all plans',
    description:
      'Retrieves a list of all available subscription plans with their variants and active prices.',
  })
  @ApiResponse({ status: 200, description: 'Return all plans.' })
  async findAll() {
    const plans = await this.plansService.findAll();
    this.logger.log(
      `[GET /system/plans] Returning ${plans?.length ?? 0} plans:\n${JSON.stringify(plans, null, 2)}`,
    );
    return plans;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a plan by ID',
    description:
      'Retrieves details of a specific plan by its unique ID (or legacy tier ID / variant ID).',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the plan details.',
  })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  async findOne(@Param('id') id: string) {
    try {
      const plan = await this.plansService.findOne(id);
      this.logger.log(
        `[GET /system/plans/${id}] Returning plan:\n${JSON.stringify(plan, null, 2)}`,
      );
      return plan;
    } catch {
      try {
        const variantPlan = await this.findVariantAsPlan(id);
        this.logger.log(
          `[GET /system/plans/${id}] Returning synthesized variant-as-plan:\n${JSON.stringify(variantPlan, null, 2)}`,
        );
        return variantPlan;
      } catch {
        try {
          const tier = await this.tierService.findOne(id);
          this.logger.log(
            `[GET /system/plans/${id}] Returning legacy tier:\n${JSON.stringify(tier, null, 2)}`,
          );
          return tier;
        } catch (tierError) {
          if (tierError instanceof NotFoundException) {
            throw new NotFoundException(`Plan with ID ${id} not found`);
          }
          throw tierError;
        }
      }
    }
  }

  /**
   * Synthesizes a plan-variant into the legacy plan shape MCOM Solutions'
   * connector expects. Variants are one-off purchases (no recurring price),
   * so the active one-off amount is mirrored across all billing cycles —
   * whichever cycle Solutions requests resolves to the correct charge.
   */
  private async findVariantAsPlan(id: string) {
    const { variant, price } = await this.plansService.resolveActivePrice(id);
    const level = variant.tierLevel?.name;
    const label =
      level === PlanTier.PRO_PLUS
        ? 'Pro+'
        : level === PlanTier.PRO
          ? 'Pro'
          : 'Standard';
    const amount = Number(price.amount);
    return {
      id: variant.id,
      name: `${variant.plan?.name ?? 'Plan'} · ${label}`,
      description: variant.plan?.description ?? null,
      monthlyPrice: amount,
      quarterlyPrice: amount,
      annualPrice: amount,
      features: variant.features ?? [],
      configuration: variant.configuration ?? null,
      isActive: variant.isActive && (variant.plan?.isActive ?? true),
      isDefault: false,
      type: level ?? PlanTier.STANDARD,
      trialDuration: null,
      seasonId: null,
      stripeMonthlyPriceId: null,
      stripeQuarterlyPriceId: null,
      stripeAnnualPriceId: null,
      paypalMonthlyPlanId: null,
      paypalQuarterlyPlanId: null,
      paypalAnnualPlanId: null,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a plan (MCOM Solution Admin)',
    description:
      'Updates an existing plan. Only authorized MCOM Solution requests can perform this action.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan updated successfully.',
    type: Tier,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing API key.',
  })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Plan with this name already exists.',
  })
  update(@Param('id') id: string, @Body() updateTierDto: UpdateTierDto) {
    return this.tierService.update(id, updateTierDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a plan (MCOM Solution Admin)',
    description:
      'Deletes a plan. Only authorized MCOM Solution requests can perform this action.',
  })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing API key.',
  })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  remove(@Param('id') id: string) {
    return this.tierService.remove(id);
  }
}
