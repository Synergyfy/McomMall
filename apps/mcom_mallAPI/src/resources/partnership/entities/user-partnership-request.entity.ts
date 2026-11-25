import { Column, Entity, ManyToOne, CreateDateColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { PartnershipStatus } from '../partnership-status.enum';

@Entity('user_partnership_requests')
export class UserPartnershipRequest extends AbstractBaseEntity {
  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => User)
  receiver: User;

  @Column({
    type: 'enum',
    enum: PartnershipStatus,
    default: PartnershipStatus.PENDING,
  })
  status: PartnershipStatus;

  @Column({ nullable: true })
  rejectionMessage?: string;

  @Column({ nullable: true })
  message?: string;

  @CreateDateColumn()
  sentAt: Date;

  @Column({ nullable: true })
  acceptedAt?: Date;

  @Column({ nullable: true })
  rejectedAt?: Date;

  /** Marker: declined automatically because a Central account was deleted. */
  @Column({ type: 'timestamptz', nullable: true })
  centralDeclinedAt?: Date | null;

  /** Central-deleted account that caused the automatic decline (for restore). */
  @Column({ type: 'uuid', nullable: true })
  centralDeclinedForUserId?: string | null;

  /** Convenience fields populated by the service when listing requests. */
  senderBusinessId?: string | null;
  receiverBusinessId?: string | null;
}
