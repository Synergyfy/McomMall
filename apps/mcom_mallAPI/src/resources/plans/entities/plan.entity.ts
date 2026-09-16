import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { PlanVariant } from './plan-variant.entity';

@Entity('plans')
export class Plan extends AbstractBaseEntity {
  @ApiProperty({
    example: 'Gold',
    description: 'Display name of the plan family',
  })
  @Column()
  name: string;

  @ApiProperty({ example: 'gold', description: 'URL-safe unique slug' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    example: 'For established high-street businesses',
    description: 'Plan description',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: true, description: 'Whether the plan is sold' })
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PlanVariant, (variant) => variant.plan)
  variants: PlanVariant[];
}
