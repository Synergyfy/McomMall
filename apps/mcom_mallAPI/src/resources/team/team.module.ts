import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamMember } from './entities/team-member.entity';
import { TeamInvite } from './entities/team-invite.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, TeamInvite, User, Business])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
