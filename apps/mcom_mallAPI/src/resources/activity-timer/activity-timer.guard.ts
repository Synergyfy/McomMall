import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ActivityTimerService } from './activity-timer.service';
import { UserRole } from '../../common/role.enum';

@Injectable()
export class ActivityTimerGuard implements CanActivate {
  constructor(private readonly timerService: ActivityTimerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admins are not restricted
    if (user && user.role === UserRole.ADMIN) {
      return true;
    }

    if (user) {
      const isRestricted = await this.timerService.isRestricted(user);
      if (isRestricted) {
        throw new ForbiddenException(
          'Your trial period has expired or is paused. Please resume your trial or subscribe to a tier to continue.',
        );
      }
    }

    return true;
  }
}
