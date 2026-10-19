import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ServiceAuthGuard } from '../service-mesh/guards/service-auth.guard';
import { ServiceScopesGuard } from '../service-mesh/guards/service-scopes.guard';
import { RequireServiceScopes } from '../service-mesh/decorators/require-service-scopes.decorator';
import { SERVICE_SCOPE_MALL_READ } from '../service-mesh/constants';
import { PartnerCatalogService } from './partner-catalog.service';

/**
 * Read-only mall catalog exposed to ecosystem partners (e.g. MCOM Rewards) so
 * they can target mall products/services when configuring rewards.
 *
 * Auth: RS256 service token (audience = "mcom-mall"), scope `mall:read`.
 */
@ApiTags('Mall Partner Catalog')
@ApiSecurity('mcom-service-token')
@Controller('partner/catalog')
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard)
export class PartnerCatalogController {
  constructor(private readonly catalog: PartnerCatalogService) {}

  @Get('business')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({
    summary: 'Resolve a mall business and its catalogue by MCOM user id or email',
  })
  @ApiQuery({ name: 'mcomUserId', required: false })
  @ApiQuery({ name: 'email', required: false })
  getBusiness(
    @Query('mcomUserId') mcomUserId?: string,
    @Query('email') email?: string,
  ) {
    return this.catalog.getBusiness({ mcomUserId, email });
  }

  @Get('business/:businessId/products')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'List products for a mall business' })
  listProducts(@Param('businessId') businessId: string) {
    return this.catalog.listProducts(businessId);
  }

  @Get('business/:businessId/services')
  @RequireServiceScopes(SERVICE_SCOPE_MALL_READ)
  @ApiOperation({ summary: 'List services for a mall business' })
  listServices(@Param('businessId') businessId: string) {
    return this.catalog.listServices(businessId);
  }
}
