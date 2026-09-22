import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export enum PartnerStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

@Entity('institutional_partners')
export class InstitutionalPartner extends AbstractBaseEntity {
  @ApiProperty({ example: 'City Commerce Association' })
  @Column()
  @Index()
  name: string;

  @ApiProperty({ enum: PartnerStatus, example: PartnerStatus.ACTIVE })
  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.PENDING })
  @Index()
  status: PartnerStatus;

  @ApiPropertyOptional({ example: 'Regional Partner' })
  @Column({ nullable: true })
  type?: string;

  @ApiPropertyOptional({ example: 'David Chen' })
  @Column({ nullable: true })
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'david@citycomm.org' })
  @Column({ nullable: true })
  email?: string;

  @ApiPropertyOptional({ example: '+44 20 7123 4567' })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ example: 0, description: 'QR plaques distributed' })
  @Column({ type: 'int', default: 0 })
  plaqueCount: number;

  @ApiProperty({ example: 0, description: 'Businesses onboarded via partner' })
  @Column({ type: 'int', default: 0 })
  businessCount: number;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @Column({ type: 'date', nullable: true })
  startDate?: string;
}
