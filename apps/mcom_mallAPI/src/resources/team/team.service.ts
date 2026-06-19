import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember, TeamRole, TeamMemberStatus } from './entities/team-member.entity';
import { TeamInvite, TeamInviteStatus } from './entities/team-invite.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(TeamInvite)
    private readonly teamInviteRepository: Repository<TeamInvite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async getTeam(businessId: string) {
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundException(`Business storefront not found`);
    }

    const members = await this.teamMemberRepository.find({
      where: { businessId },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });

    const invites = await this.teamInviteRepository.find({
      where: { businessId, status: TeamInviteStatus.PENDING },
      order: { created_at: 'ASC' },
    });

    return {
      members: members.map(m => ({
        id: m.id,
        userId: m.userId,
        name: m.user ? `${m.user.firstName} ${m.user.lastName}` : 'Pending Signup',
        email: m.user?.email || 'N/A',
        role: m.role,
        status: m.status,
        permissions: m.permissions,
        created_at: m.created_at,
      })),
      invites: invites.map(i => ({
        id: i.id,
        email: i.email,
        role: i.role,
        status: i.status,
        permissions: i.permissions,
        expiresAt: i.expiresAt,
        created_at: i.created_at,
      })),
    };
  }

  async inviteMember(businessId: string, dto: InviteMemberDto) {
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundException(`Business storefront not found`);
    }

    const targetUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (targetUser) {
      const existingMember = await this.teamMemberRepository.findOne({
        where: { businessId, userId: targetUser.id },
      });
      if (existingMember) {
        throw new BadRequestException('User is already a team member of this business');
      }
    }

    // Check if there's already an active pending invite for this email
    let invite = await this.teamInviteRepository.findOne({
      where: { businessId, email: dto.email, status: TeamInviteStatus.PENDING },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    if (invite) {
      invite.role = dto.role;
      invite.permissions = dto.permissions;
      invite.expiresAt = expiresAt;
    } else {
      invite = this.teamInviteRepository.create({
        email: dto.email,
        businessId,
        role: dto.role,
        permissions: dto.permissions,
        status: TeamInviteStatus.PENDING,
        expiresAt,
      });
    }

    await this.teamInviteRepository.save(invite);
    console.log(`[TeamService] Dispatched invite email to ${dto.email} for business ${businessId}`);
    return invite;
  }

  async updateMember(businessId: string, memberId: string, dto: UpdateMemberDto) {
    const member = await this.teamMemberRepository.findOne({
      where: { id: memberId, businessId },
    });
    if (!member) {
      throw new NotFoundException(`Team member not found`);
    }

    if (dto.role) member.role = dto.role;
    if (dto.status) member.status = dto.status;
    if (dto.permissions) member.permissions = dto.permissions;

    return this.teamMemberRepository.save(member);
  }

  async removeMember(businessId: string, memberId: string) {
    const member = await this.teamMemberRepository.findOne({
      where: { id: memberId, businessId },
    });
    if (!member) {
      throw new NotFoundException(`Team member not found`);
    }
    await this.teamMemberRepository.remove(member);
    return { success: true, message: 'Member removed successfully' };
  }

  async revokeInvite(businessId: string, inviteId: string) {
    const invite = await this.teamInviteRepository.findOne({
      where: { id: inviteId, businessId },
    });
    if (!invite) {
      throw new NotFoundException(`Invite not found`);
    }
    await this.teamInviteRepository.remove(invite);
    return { success: true, message: 'Invite revoked successfully' };
  }
}
