export enum PlanType {
  PAYG = 'PAYG',
  CO_BRANDED = 'CO_BRANDED',
}

export enum PaygOption {
  NINETY_DAYS = 'NINETY_DAYS',
  ONE_EIGHTY_DAYS = 'ONE_EIGHTY_DAYS',
  TWO_SEVENTY_DAYS = 'TWO_SEVENTY_DAYS',
}

export enum PaymentGateway {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export interface CreatePaymentIntentDto {
  amount: number;
  currency?: string;
}

export interface RecordPaymentDto {
  amount: number;
  planType: PlanType;
  paygOption?: PaygOption;
  isTrial: boolean;
  paymentGateway: PaymentGateway;
  transactionId: string;
  currency?: string;
}

export enum SubscriptionStatusEnum {
  TRIAL_ACTIVE = 'TRIAL_ACTIVE',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  PAID = 'PAID',
  INACTIVE = 'INACTIVE',
}

export interface TrialTasks {
  createdBusiness: boolean;
  createdProductOrService: boolean;
  createdPromotion: boolean;
  createdOffer: boolean;
  createdCoupon: boolean;
}

export interface SubscriptionStatusResponse {
  status: SubscriptionStatusEnum;
  planType: PlanType;
  paygOption: PaygOption | null;
  trialEndDate: string | null;
  isPaused: boolean;
  isTrialPausable: boolean;
  remainingPauses: number;
  remainingTime: number;
  tasks: TrialTasks;
}

export enum TrialAction {
  PAUSE = 'pause',
  RESUME = 'resume',
}

export interface PauseResumeTrialDto {
  action: TrialAction;
}
