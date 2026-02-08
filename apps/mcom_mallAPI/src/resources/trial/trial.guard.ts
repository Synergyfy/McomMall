import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TrialService } from './trial.service';

@Injectable()
export class TrialGuard implements CanActivate {
  constructor(private readonly trialService: TrialService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (userId) {
      await this.trialService.checkAndResumeTrial(userId);
    }

    return true;
  }
}
