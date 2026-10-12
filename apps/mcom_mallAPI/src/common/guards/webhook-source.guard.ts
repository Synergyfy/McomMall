import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Optional source-IP allowlist for provider webhook endpoints.
 *
 * Signature verification (Stripe HMAC / PayPal verify-webhook-signature) is the
 * primary control; this guard is defence-in-depth for operators who also want to
 * restrict webhook traffic to a known set of provider egress IPs.
 *
 * Fail-closed behaviour: when WEBHOOK_ALLOWED_IPS is configured, any request
 * from an IP not in the list is rejected. When it is NOT configured the guard
 * is a no-op and requests still must pass cryptographic signature verification.
 */
@Injectable()
export class WebhookSourceGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSourceGuard.name);
  private readonly allowedIps: string[] = (
    process.env.WEBHOOK_ALLOWED_IPS ?? ''
  )
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  canActivate(context: ExecutionContext): boolean {
    if (this.allowedIps.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const trustProxy = process.env.TRUST_PROXY === 'true';
    const forwarded = request.headers['x-forwarded-for'];
    let ip: string | undefined =
      trustProxy && forwarded
        ? typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : forwarded[0]
        : request.ip || request.socket?.remoteAddress;

    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.slice(7);
    }

    if (ip && this.allowedIps.includes(ip)) {
      return true;
    }

    this.logger.warn(`Blocked webhook from unauthorized source IP: ${ip}`);
    throw new ForbiddenException('Webhook source not allowed');
  }
}
