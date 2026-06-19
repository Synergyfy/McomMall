import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../listings/entities/listing.entity';
import { AuditType } from '../enums/audit-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audits')
export class Audit extends AbstractBaseEntity {
  @ApiProperty({ enum: AuditType })
  @Column({ type: 'enum', enum: AuditType })
  type: AuditType;

  @ApiProperty({ example: 78 })
  @Column({ type: 'int' })
  score: number;

  @ApiProperty({ example: 85 })
  @Column({ type: 'int', default: 70 })
  storefrontScore: number;

  @ApiProperty({ example: 22.0 })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  revenueLift: number;

  @ApiProperty({ example: { q1: 'daily' } })
  @Column({ type: 'jsonb' })
  responses: any;

  @ApiProperty({ example: [{ title: 'Activate Loyalty Vouchers' }] })
  @Column({ type: 'jsonb' })
  suggestions: any;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'business_id' })
  business?: Business;

  @Column({ name: 'business_id', nullable: true })
  businessId?: string;
}
