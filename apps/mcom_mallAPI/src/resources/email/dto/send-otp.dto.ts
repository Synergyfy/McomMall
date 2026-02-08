import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OtpType } from '../entities/otp.entity';

export class SendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(OtpType)
  @IsNotEmpty()
  type: OtpType;
}
