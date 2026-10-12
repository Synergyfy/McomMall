import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly allowedIps: string[] = [
    ...(process.env.SYSTEM_ALLOWED_IPS
      ? process.env.SYSTEM_ALLOWED_IPS.split(',')
          .map((ip) => ip.trim())
          .filter(Boolean)
      : []),
    process.env.LOYALTY_API_IP,
  ].filter((ip): ip is string => Boolean(ip && ip.trim()));

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Only trust X-Forwarded-For when explicitly enabled (i.e. behind a trusted
    // proxy). Otherwise an attacker can spoof the header to appear as an
    // allowed IP. `request.ip` already honours Express' `trust proxy` config.
    const trustProxy = process.env.TRUST_PROXY === 'true';
    const forwarded = request.headers['x-forwarded-for'];
    let requestIp: string | undefined =
      trustProxy && forwarded
        ? typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : forwarded[0]
        : request.ip || request.socket?.remoteAddress;

    // Clean IPv6 mapped IPv4.
    if (requestIp && requestIp.startsWith('::ffff:')) {
      requestIp = requestIp.slice(7);
    }

    // Loopback is only reachable locally and is useful for health checks/tests.
    const isLoopback =
      requestIp === '127.0.0.1' ||
      requestIp === '::1' ||
      requestIp === 'localhost';
    if (isLoopback || (requestIp && this.allowedIps.includes(requestIp))) {
      return true;
    }

    throw new ForbiddenException('Access denied: Unauthorized IP address.');
  }
}
