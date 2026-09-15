import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/role.enum';
import { Public } from '../../../common/decorators/public.decorator';
import { PlansService } from '../services/plans.service';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { CreatePlanPriceDto } from '../dto/create-plan-price.dto';
import { UpdatePlanDto, UpdatePlanVariantDto } from '../dto/update-plan.dto';
import { Plan } from '../entities/plan.entity';
import { PlanPrice } from '../entities/plan-price.entity';
import { PlanVariant } from '../entities/plan-variant.entity';
import { Logger } from '@nestjs/common';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  private readonly logger = new Logger(PlansController.name);

  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Create a plan family with Standard, Pro and Pro+ variants (Admin only)',
    description:
      'Creates one plan (e.g. Gold) together with exactly its 3 tier variants, each with its own price and feature configuration, in a single transaction.',
  })
  @ApiCreatedResponse({
    description: 'Plan created with 3 variants',
    type: Plan,
  })
  @ApiBadRequestResponse({
    description: 'Variants must be exactly Standard, Pro and Pro+',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or expired JWT bearer token',
  })
  @ApiConflictResponse({ description: 'Plan with this slug already exists' })
  create(@Body() dto: CreatePlanDto): Promise<Plan> {
    return this.plansService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all plans with active variant prices' })
  @ApiOkResponse({ description: 'Return all plans', type: [Plan] })
  async findAll(): Promise<Plan[]> {
    const plans = await this.plansService.findAll();
    this.logger.log(
      `[GET /plans] Returning ${plans?.length ?? 0} plans:\n${JSON.stringify(plans, null, 2)}`,
    );
    return plans;
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get one plan with its variants and active prices' })
  @ApiOkResponse({ description: 'Return the plan', type: Plan })
  @ApiNotFoundResponse({ description: 'Plan with specified ID was not found' })
  async findOne(@Param('id') id: string): Promise<Plan> {
    const plan = await this.plansService.findOne(id);
    this.logger.log(
      `[GET /plans/${id}] Returning plan:\n${JSON.stringify(plan, null, 2)}`,
    );
    return plan;
  }

  @Post('variants/:variantId/prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reprice a plan variant (Admin only)',
    description:
      'Supersedes the active price row with a new versioned row so existing subscribers keep their locked-in price.',
  })
  @ApiCreatedResponse({
    description: 'New active price created',
    type: PlanPrice,
  })
  @ApiBadRequestResponse({ description: 'Invalid amount or variant' })
  @ApiUnauthorizedResponse({
    description: 'Missing or expired JWT bearer token',
  })
  @ApiNotFoundResponse({
    description: 'Plan variant with specified ID was not found',
  })
  createPrice(
    @Param('variantId') variantId: string,
    @Body() dto: CreatePlanPriceDto,
  ): Promise<PlanPrice> {
    return this.plansService.createPrice(variantId, dto);
  }

  @Patch('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a plan variant configuration (Admin only)',
    description:
      'Updates display features, enforced quotas/flags and the active flag. Prices cannot change here — use the reprice endpoint.',
  })
  @ApiOkResponse({ description: 'Variant updated', type: PlanVariant })
  @ApiBadRequestResponse({ description: 'Invalid configuration payload' })
  @ApiUnauthorizedResponse({
    description: 'Missing or expired JWT bearer token',
  })
  @ApiNotFoundResponse({
    description: 'Plan variant with specified ID was not found',
  })
  updateVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdatePlanVariantDto,
  ): Promise<PlanVariant> {
    return this.plansService.updateVariant(variantId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a plan family (Admin only)',
    description:
      'Updates name, slug, description or active flag. Variants and prices use their own endpoints.',
  })
  @ApiOkResponse({ description: 'Plan updated', type: Plan })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  @ApiUnauthorizedResponse({
    description: 'Missing or expired JWT bearer token',
  })
  @ApiNotFoundResponse({ description: 'Plan with specified ID was not found' })
  @ApiConflictResponse({ description: 'Plan with this slug already exists' })
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto): Promise<Plan> {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a plan family (Admin only)',
    description:
      'Deletes the plan with its variants, prices and feature links. Shared tier levels are untouched.',
  })
  @ApiOkResponse({ description: 'Plan deleted' })
  @ApiUnauthorizedResponse({
    description: 'Missing or expired JWT bearer token',
  })
  @ApiNotFoundResponse({ description: 'Plan with specified ID was not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.plansService.remove(id);
  }
}
