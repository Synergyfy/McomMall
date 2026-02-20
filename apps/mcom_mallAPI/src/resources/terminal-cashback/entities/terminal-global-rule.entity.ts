import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('terminal_global_rules')
export class TerminalGlobalRule extends AbstractBaseEntity {
  @ApiProperty({
    example: 'DEFAULT_AUTO_APPROVAL_HOURS',
    description: 'Unique key for the rule',
  })
  @PrimaryColumn()
  ruleKey: string;

  @ApiProperty({
    example: '48',
    description: 'Value of the rule (stored as string)',
  })
  @Column('text')
  value: string;

  @ApiProperty({
    example: 'Global default hours before a claim is auto-approved',
    description: 'Description of the rule',
    nullable: true,
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ example: true, description: 'Is the rule currently active?' })
  @Column({ default: true })
  isActive: boolean;
}
