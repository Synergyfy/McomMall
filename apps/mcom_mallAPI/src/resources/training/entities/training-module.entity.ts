import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export enum TrainingKind {
  COURSE = 'course',
  WEBINAR = 'webinar',
  DOC = 'doc',
}

@Entity('training_modules')
export class TrainingModule extends AbstractBaseEntity {
  @ApiProperty({ example: 'Seller Onboarding 101' })
  @Column()
  @Index()
  title: string;

  @ApiProperty({ enum: TrainingKind, example: TrainingKind.COURSE })
  @Column({ type: 'enum', enum: TrainingKind, default: TrainingKind.COURSE })
  kind: TrainingKind;

  @ApiPropertyOptional({ example: 'Learn the marketplace basics in 45 minutes.' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/training/onboarding-101.mp4' })
  @Column({ nullable: true })
  contentUrl?: string;

  @ApiPropertyOptional({ example: 45, description: 'Duration in minutes' })
  @Column({ type: 'int', nullable: true })
  durationMinutes?: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isPublished: boolean;
}
