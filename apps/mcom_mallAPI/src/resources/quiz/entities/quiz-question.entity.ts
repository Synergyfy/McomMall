import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity('quiz_questions')
export class QuizQuestion extends AbstractBaseEntity {
  @Column({ type: 'text' })
  question: string;

  @Column('simple-array')
  options: string[];

  @Column({ type: 'int' })
  correctAnswerIndex: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Index()
  @Column({ default: true })
  isActive: boolean;
}
