import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

@Injectable()
export class McomSolutionAuthGuard implements CanActivate {
  private readonly logger = new Logger(McomSolutionAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = (request.headers['x-mcom-solution-api-key'] ||
      request.headers['x-api-key']) as string | undefined;

    const validKeys: string[] = [
      this.configService.get<string>('MCOM_SOLUTION_API_KEY'),
      this.configService.get<string>('MCOM_API_KEY'),
      process.env.MCOM_SOLUTION_API_KEY,
      process.env.MCOM_API_KEY,
    ]
      .filter((k): k is string => Boolean(k && k.trim()))
      .map((k) => k.trim());

    // Dynamically check on-disk .env files to support hot changes in running dev servers
    const candidateEnvPaths = [
      path.resolve(process.cwd(), 'apps/mcom_mallAPI/.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '../../../.env'),
      path.resolve(__dirname, '../../../../.env'),
    ];

    for (const envPath of candidateEnvPaths) {
      try {
        if (fs.existsSync(envPath)) {
          const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
          if (parsed.MCOM_SOLUTION_API_KEY)
            validKeys.push(parsed.MCOM_SOLUTION_API_KEY.trim());
          if (parsed.MCOM_API_KEY) validKeys.push(parsed.MCOM_API_KEY.trim());
        }
      } catch {}
    }

    if (validKeys.length === 0) {
      this.logger.error(
        `[AuthGuard] No MCOM Solution API key configured on server for ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException(
        'MCOM_SOLUTION_API_KEY not configured on server',
      );
    }

    const cleanReceived = (apiKey || '').trim();
    const isMatch = validKeys.some((k) => k === cleanReceived);

    if (!cleanReceived || !isMatch) {
      this.logger.warn(
        `[AuthGuard] Rejected ${request.method} ${request.url} - Key mismatch. Received: '${cleanReceived}' (len=${cleanReceived.length}), Expected one of: ${validKeys.map((k) => `'${k.substring(0, 10)}...' (len=${k.length})`).join(', ')}`,
      );
      throw new UnauthorizedException(
        'Invalid or missing MCOM Solution API key',
      );
    }
    this.logger.log(`[AuthGuard] Authorized ${request.method} ${request.url}`);
    return true;
  }
}
