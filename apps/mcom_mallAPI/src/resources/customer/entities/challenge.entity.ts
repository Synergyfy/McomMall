import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { ChallengeType } from '../reward.enum';
import { ChallengeProgress } from './challenge-progress.entity';

@Entity('challenges')
export class Challenge extends AbstractBaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ChallengeType,
    default: ChallengeType.CUSTOM,
  })
  challengeType: ChallengeType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  target: number;

  @Column({ type: 'int', default: 0 })
  rewardPoints: number;

  @Index()
  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ChallengeProgress, (progress) => progress.challenge)
  progress: ChallengeProgress[];
}
