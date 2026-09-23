import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity('webhooks')
export class Webhook extends AbstractBaseEntity {
  @ApiProperty({ example: 'Order events to ERP' })
  @Column()
  @Index()
  name: string;

  @ApiProperty({ example: 'https://erp.example.com/hooks/orders' })
  @Column()
  url: string;

  @ApiProperty({ example: ['order.created', 'order.paid'] })
  @Column({ type: 'simple-array', default: '' })
  events: string[];

  @ApiPropertyOptional({ example: 'whsec_abc123', description: 'Signing secret reference (never returned once set)' })
  @Column({ nullable: true, select: false })
  secret?: string;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Last successful or attempted delivery' })
  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt?: Date;

  @ApiProperty({ example: 0 })
  @Column({ type: 'int', default: 0 })
  failureCount: number;
}
