import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeamRole, TeamMemberStatus, TeamPermissions } from '../entities/team-member.entity';

export class UpdateMemberDto {
  @ApiProperty({
    enum: TeamRole,
    example: TeamRole.STAFF,
    required: false,
    description: 'Updated role of the team member',
  })
  @IsEnum(TeamRole)
  @IsOptional()
  role?: TeamRole;

  @ApiProperty({
    enum: TeamMemberStatus,
    example: TeamMemberStatus.ACTIVE,
    required: false,
    description: 'Updated status of the team member',
  })
  @IsEnum(TeamMemberStatus)
  @IsOptional()
  status?: TeamMemberStatus;

  @ApiProperty({
    required: false,
    description: 'Updated accessibility toggles for the member',
  })
  @IsObject()
  @IsOptional()
  permissions?: TeamPermissions;
}
