import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CapabilityService, ActionType } from '../capability.service';
import {
  CHECK_PERMISSION_KEY,
  PermissionContext,
} from '../decorators/check-permission.decorator';
import { UserRole } from '../../../common/role.enum';

@Injectable()
export class CapabilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private capabilityService: CapabilityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<{
      action: ActionType;
      context: PermissionContext;
    }>(CHECK_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!metadata) {
      return true;
    }

    const { action, context: staticContext } = metadata;
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Let AuthGuard handle it
    }

    // Exclude Admin from checks
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Dynamic context extraction could happen here if needed,
    // but simplified compared to McomLoyaltyAPI as counts are handled in service now.
    const dynamicContext = {};
    const finalContext = { ...staticContext, ...dynamicContext };

    await this.capabilityService.checkPermission(user.id, action, finalContext);

    return true;
  }
}
