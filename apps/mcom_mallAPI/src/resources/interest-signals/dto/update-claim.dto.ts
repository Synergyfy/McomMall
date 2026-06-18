import { IsEnum, IsNotEmpty } from 'class-validator';
import { ClaimStatus } from '../entities/business-claim.entity';

export class UpdateClaimDto {
  @IsEnum(ClaimStatus)
  @IsNotEmpty()
  status: ClaimStatus;
}
