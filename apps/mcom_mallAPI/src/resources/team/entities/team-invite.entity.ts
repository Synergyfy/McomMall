import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { TeamRole, TeamPermissions } from './team-member.entity';

export enum TeamInviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
}

@Entity('team_invites')
export class TeamInvite extends AbstractBaseEntity {
  @Column()
  email: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  businessId: string;

  @Column({ type: 'enum', enum: TeamRole, default: TeamRole.STAFF })
  role: TeamRole;

  @Column({ type: 'enum', enum: TeamInviteStatus, default: TeamInviteStatus.PENDING })
  status: TeamInviteStatus;

  @Column({ type: 'jsonb', nullable: true })
  permissions: TeamPermissions;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}
