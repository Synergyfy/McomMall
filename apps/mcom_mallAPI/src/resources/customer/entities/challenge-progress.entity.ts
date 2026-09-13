import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Challenge } from './challenge.entity';

@Entity('challenge_progress')
@Unique(['challengeId', 'userId'])
export class ChallengeProgress extends AbstractBaseEntity {
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Challenge, (challenge) => challenge.progress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;

  @Column()
  challengeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  progress: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  completedAt: Date;
}
