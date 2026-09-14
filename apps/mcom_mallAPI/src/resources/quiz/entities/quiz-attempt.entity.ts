import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('quiz_attempts')
export class QuizAttempt extends AbstractBaseEntity {
  @Index()
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'jsonb', default: '[]' })
  answers: Array<{
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
  }>;
}
