import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn } from 'class-validator';
import { ProposalStatus } from '../entities/proposal-status.enum';

export class UpdateExchangeProposalDto {
  @IsEnum(ProposalStatus)
  @IsIn([ProposalStatus.ACCEPTED, ProposalStatus.REJECTED])
  @ApiProperty({
    description:
      'The new status for the proposal. Must be either ACCEPTED or REJECTED.',
    enum: [ProposalStatus.ACCEPTED, ProposalStatus.REJECTED],
    example: ProposalStatus.ACCEPTED,
  })
  status: ProposalStatus.ACCEPTED | ProposalStatus.REJECTED;
}
