import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  // Define allowed IPs. In production, load this from environment variables (e.g., process.env.ALLOWED_IPS.split(','))
  private readonly allowedIps = [
    '127.0.0.1',
    '::1',
    process.env.LOYALTY_API_IP,
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract IP. This handles standard headers and proxy forwarded headers.
    let requestIp = request.ip || request.socket.remoteAddress;

    // Handle specific proxy headers if behind Nginx/Load Balancer
    if (request.headers['x-forwarded-for']) {
      const forwarded = request.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        requestIp = forwarded.split(',')[0].trim();
      } else {
        requestIp = forwarded[0];
      }
    }

    // Clean IPv6 mapped IPv4
    if (requestIp && requestIp.startsWith('::ffff:')) {
      requestIp = requestIp.substr(7);
    }

    // Check if the IP is in the allowed list
    if (this.allowedIps.includes(requestIp)) {
      return true;
    }

    // For debugging locally, you might want to log the rejected IP
    console.warn(`Blocked request from unauthorized IP: ${requestIp}`);

    throw new ForbiddenException('Access denied: Unauthorized IP address.');
  }
}
