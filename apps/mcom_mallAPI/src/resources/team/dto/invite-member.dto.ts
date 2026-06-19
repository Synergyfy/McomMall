import { IsEmail, IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeamRole, TeamPermissions } from '../entities/team-member.entity';

export class InviteMemberDto {
  @ApiProperty({
    example: 'staff@example.com',
    description: 'Email of the team member to invite',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    enum: TeamRole,
    example: TeamRole.STAFF,
    description: 'Role of the team member',
  })
  @IsEnum(TeamRole)
  @IsNotEmpty()
  role: TeamRole;

  @ApiProperty({
    description: 'Custom accessibility toggles for the member',
  })
  @IsObject()
  @IsNotEmpty()
  permissions: TeamPermissions;
}
