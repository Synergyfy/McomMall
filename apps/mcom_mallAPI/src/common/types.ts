import { Request } from 'express';
import { User } from '../resources/users/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User & { businessId: string };
}
