import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TerminalCashbackStatus } from '../entities/terminal-cashback-claim.entity';

export class UpdateTerminalCashbackStatusDto {
  @ApiProperty({
    enum: TerminalCashbackStatus,
    description: 'New status for the claim',
  })
  @IsEnum(TerminalCashbackStatus)
  @IsNotEmpty()
  status: TerminalCashbackStatus;
}
