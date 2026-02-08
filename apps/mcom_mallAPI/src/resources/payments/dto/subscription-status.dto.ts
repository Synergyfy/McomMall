import { PlanType } from '../enums/plan-type.enum';
import { PaygOption } from '../enums/payg-option.enum';

export enum SubscriptionStatusEnum {
  TRIAL_ACTIVE = 'TRIAL_ACTIVE',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  PAID = 'PAID',
  INACTIVE = 'INACTIVE',
}

export class SubscriptionStatusDto {
  status: SubscriptionStatusEnum;
  planType?: PlanType;
  paygOption?: PaygOption;
  trialEndDate?: Date;
  isPaused?: boolean;
  remainingPauses?: number;
  isTrialPausable?: boolean;
}
