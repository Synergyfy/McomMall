import { IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../order/entities/order-payment.entity';
import { InitiateReloadDto } from './initiate-reload.dto';

export class VerifyReloadDto {
  @IsObject()
  @ValidateNested()
  @Type(() => InitiateReloadDto)
  reloadDetails: InitiateReloadDto;

  @IsString()
  @IsNotEmpty()
  paymentProvider: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  transactionId: string;
}