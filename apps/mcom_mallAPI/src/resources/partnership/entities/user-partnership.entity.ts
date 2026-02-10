import { Column, Entity, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { UserPartnershipRequest } from './user-partnership-request.entity';

@Entity('user_partnerships')
export class UserPartnership extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user1: User;

  @ManyToOne(() => User)
  user2: User;

  @OneToOne(() => UserPartnershipRequest)
  @JoinColumn()
  request: UserPartnershipRequest;

  @Column({ default: true })
  isActive: boolean;
}
