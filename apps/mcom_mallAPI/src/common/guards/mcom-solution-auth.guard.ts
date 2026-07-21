import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class McomSolutionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-mcom-solution-api-key'] as string | undefined;
    const validKey = process.env.MCOM_SOLUTION_API_KEY;
    if (!validKey) {
      throw new UnauthorizedException('MCOM_SOLUTION_API_KEY not configured on server');
    }
    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('Invalid or missing MCOM Solution API key');
    }
    return true;
  }
}
