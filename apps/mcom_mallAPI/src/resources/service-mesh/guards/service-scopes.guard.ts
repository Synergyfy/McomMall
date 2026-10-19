import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_SERVICE_SCOPES_KEY } from '../decorators/require-service-scopes.decorator';
import { AuthenticatedServiceRequest } from '../interfaces/authenticated-service-request.interface';

/**
 * Enforces the scopes declared with RequireServiceScopes.
 * Must run AFTER ServiceAuthGuard (which attaches `req.serviceCaller`).
 */
@Injectable()
export class ServiceScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_SERVICE_SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedServiceRequest>();
    const granted = request.serviceCaller?.scopes ?? [];
    const missing = required.filter((scope) => !granted.includes(scope));

    if (missing.length > 0) {
      throw new ForbiddenException(
        `Forbidden: Missing required scope(s): ${missing.join(', ')}`,
      );
    }

    return true;
  }
}
