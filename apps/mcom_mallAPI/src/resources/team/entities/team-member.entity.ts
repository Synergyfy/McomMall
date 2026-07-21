import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../listings/entities/listing.entity';

export enum TeamRole {
  MANAGER = 'manager',
  STAFF = 'staff',
  AGENT = 'agent',
}

export enum TeamMemberStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export interface TeamPermissions {
  storefront: boolean;
  analytics: boolean;
  orders: boolean;
  customers: boolean;
  marketing: boolean;
  inventory: boolean;
}

@Entity('team_members')
export class TeamMember extends AbstractBaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  businessId: string;

  @Column({ type: 'enum', enum: TeamRole, default: TeamRole.STAFF })
  role: TeamRole;

  @Column({
    type: 'enum',
    enum: TeamMemberStatus,
    default: TeamMemberStatus.ACTIVE,
  })
  status: TeamMemberStatus;

  @Column({ type: 'jsonb', nullable: true })
  permissions: TeamPermissions;
}
