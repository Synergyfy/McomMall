import { PaygOption, PlanType } from './types';

export interface Subscription {
  id: string;
  created_at: string;
  updated_at: string;
  planType: PlanType;
  paygOption: PaygOption;
  isActive: boolean;
  isPaused: boolean;
  startedAt: string;
  pausedAt: string | null;
  totalPausedDuration: number;
}
