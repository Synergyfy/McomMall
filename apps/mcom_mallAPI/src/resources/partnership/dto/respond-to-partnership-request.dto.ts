import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PartnershipRequestStatus } from '../partnership.enum';

export class RespondToPartnershipRequestDto {
  @ApiProperty({
    description: 'The response to the partnership request.',
    enum: [
      PartnershipRequestStatus.ACCEPTED,
      PartnershipRequestStatus.DECLINED,
    ],
    example: PartnershipRequestStatus.ACCEPTED,
  })
  @IsEnum([
    PartnershipRequestStatus.ACCEPTED,
    PartnershipRequestStatus.DECLINED,
  ])
  status: PartnershipRequestStatus.ACCEPTED | PartnershipRequestStatus.DECLINED;
}
