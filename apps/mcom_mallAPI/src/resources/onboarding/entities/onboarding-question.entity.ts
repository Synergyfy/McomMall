import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export enum OnboardingInputType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  YESNO = 'yesno',
  IMAGE = 'image',
}

@Entity('onboarding_questions')
export class OnboardingQuestion extends AbstractBaseEntity {
  @ApiProperty({ example: 'Welcome' })
  @Column()
  title: string;

  @ApiProperty({ example: "What's the name of your business?" })
  @Column({ type: 'text' })
  prompt: string;

  @ApiProperty({ enum: OnboardingInputType, example: OnboardingInputType.TEXT })
  @Column({ type: 'enum', enum: OnboardingInputType, default: OnboardingInputType.TEXT })
  inputType: OnboardingInputType;

  @ApiProperty({ example: 0, description: 'Display order in the flow' })
  @Column({ type: 'int', default: 0 })
  @Index()
  displayOrder: number;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isRequired: boolean;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;
}
