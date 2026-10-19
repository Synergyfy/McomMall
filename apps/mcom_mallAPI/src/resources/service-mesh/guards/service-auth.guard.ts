import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwksService } from '../services/jwks.service';
import { ServiceMeshService } from '../services/service-mesh.service';
import {
  AuthenticatedServiceRequest,
  ServiceCallerContext,
} from '../interfaces/authenticated-service-request.interface';

/**
 * Inbound half of the ecosystem service mesh.
 *
 * 1. Extract the Bearer service token.
 * 2. Verify RS256 signature + issuer + audience OFFLINE via cached JWKS.
 * 3. Resolve caller identity (`act.sub` for delegated, else `sub`).
 * 4. Deny-by-default ingress check against `allowedCallers`.
 * 5. Attach `req.serviceCaller` for downstream handlers.
 */
@Injectable()
export class ServiceAuthGuard implements CanActivate {
  private readonly logger = new Logger(ServiceAuthGuard.name);
  private callersCache: { callers: string[]; expiresAt: number } | null = null;

  constructor(
    private readonly jwksService: JwksService,
    private readonly serviceMesh: ServiceMeshService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedServiceRequest>();

    const authHeader = request.headers['authorization'];
    const token =
      typeof authHeader === 'string'
        ? authHeader.replace(/^Bearer\s+/i, '').trim()
        : undefined;

    if (!token) {
      throw new UnauthorizedException(
        'Unauthorized: Missing Bearer service token',
      );
    }

    const audience = this.serviceMesh.getClientId();

    let payload;
    try {
      payload = await this.jwksService.verifyServiceToken(token, audience);
    } catch (err) {
      this.logger.warn(
        `Service token verification failed: ${(err as Error).message}`,
      );
      throw new UnauthorizedException(
        'Unauthorized: Invalid or expired service token',
      );
    }

    const isDelegated = payload.typ === 'delegated';
    const callerAppId =
      (payload.act?.sub as string | undefined) ||
      (payload.sub as string | undefined);

    if (!callerAppId) {
      throw new UnauthorizedException(
        'Unauthorized: Service token has no caller identity',
      );
    }

    const allowed = await this.getAllowedCallers();
    const isPermitted = allowed.includes('*') || allowed.includes(callerAppId);

    if (!isPermitted) {
      this.logger.warn(
        `Ingress blocked: caller "${callerAppId}" not in allowedCallers for "${audience}"`,
      );
      throw new ForbiddenException(
        `Forbidden: Caller "${callerAppId}" is not permitted to call this service`,
      );
    }

    const scopes = this.parseScopes(payload.scope);

    const caller: ServiceCallerContext = {
      callerAppId,
      isDelegated,
      userId: isDelegated ? (payload.sub as string | undefined) : undefined,
      email: payload.email,
      scopes,
      payload,
    };

    request.serviceCaller = caller;
    return true;
  }

  private parseScopes(scope: unknown): string[] {
    if (typeof scope === 'string') {
      return scope.split(/\s+/).filter(Boolean);
    }
    if (Array.isArray(scope)) {
      return scope.filter((s): s is string => typeof s === 'string');
    }
    return [];
  }

  private async getAllowedCallers(): Promise<string[]> {
    // Explicit configuration wins (fast, no network dependency).
    const fromEnv = this.configService.get<string>('MCOM_ALLOWED_CALLERS');
    if (fromEnv) {
      return fromEnv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (this.callersCache && this.callersCache.expiresAt > Date.now()) {
      return this.callersCache.callers;
    }

    try {
      const myClientId = this.serviceMesh.getClientId();
      const service = await this.serviceMesh.findService(myClientId);
      const callers = service?.allowedCallers ?? [];
      this.callersCache = {
        callers,
        expiresAt: Date.now() + 60_000,
      };
      return callers;
    } catch (err) {
      this.logger.warn(
        `Failed to resolve allowed callers from registry: ${(err as Error).message}`,
      );
      return this.callersCache?.callers ?? [];
    }
  }
}
