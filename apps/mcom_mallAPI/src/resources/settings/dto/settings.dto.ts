import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethodProvider } from '../entities/payment-method.entity';

export class UpdateIntegrationSettingsDto {
  @IsBoolean()
  @IsOptional()
  googleConnected?: boolean;

  @IsBoolean()
  @IsOptional()
  stripeConnected?: boolean;

  @IsBoolean()
  @IsOptional()
  bookingsConnected?: boolean;

  @IsString()
  @IsOptional()
  googleProfileId?: string;

  @IsString()
  @IsOptional()
  stripeAccountId?: string;
}

export class CreatePaymentMethodDto {
  @IsEnum(PaymentMethodProvider)
  @IsNotEmpty()
  provider: PaymentMethodProvider;

  @IsString()
  @IsNotEmpty()
  tokenReference: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  last4?: string;

  @IsInt()
  @IsOptional()
  expMonth?: number;

  @IsInt()
  @IsOptional()
  expYear?: number;
}
