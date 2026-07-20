import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';

@ApiTags('team')
@ApiBearerAuth()
@Controller('team')
@UseGuards(RolesGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @ApiOperation({
    summary:
      'Get all team members and pending invites for a business storefront',
  })
  @ApiResponse({ status: 200, description: 'Return team list.' })
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get(':businessId')
  async getTeam(@Param('businessId') businessId: string) {
    return this.teamService.getTeam(businessId);
  }

  @ApiOperation({ summary: 'Invite a new member to the team' })
  @ApiResponse({ status: 201, description: 'Invite created successfully.' })
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Post(':businessId/invite')
  async inviteMember(
    @Param('businessId') businessId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.teamService.inviteMember(businessId, dto);
  }

  @ApiOperation({ summary: 'Update team member role or permissions' })
  @ApiResponse({ status: 200, description: 'Member updated successfully.' })
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch(':businessId/member/:memberId')
  async updateMember(
    @Param('businessId') businessId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.teamService.updateMember(businessId, memberId, dto);
  }

  @ApiOperation({ summary: 'Remove a member from the team' })
  @ApiResponse({ status: 200, description: 'Member removed successfully.' })
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete(':businessId/member/:memberId')
  async removeMember(
    @Param('businessId') businessId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamService.removeMember(businessId, memberId);
  }

  @ApiOperation({ summary: 'Revoke/Cancel a pending team invitation' })
  @ApiResponse({ status: 200, description: 'Invitation revoked successfully.' })
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete(':businessId/invite/:inviteId')
  async revokeInvite(
    @Param('businessId') businessId: string,
    @Param('inviteId') inviteId: string,
  ) {
    return this.teamService.revokeInvite(businessId, inviteId);
  }
}
