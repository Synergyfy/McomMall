import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export enum VerificationSubjectType {
  IDENTITY = 'identity',
  BUSINESS = 'business',
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('verifications')
export class Verification extends AbstractBaseEntity {
  @ApiProperty({ enum: VerificationSubjectType, example: VerificationSubjectType.BUSINESS })
  @Column({ type: 'enum', enum: VerificationSubjectType })
  @Index()
  subjectType: VerificationSubjectType;

  @ApiPropertyOptional({ description: 'User or business UUID under review' })
  @Column({ type: 'uuid', nullable: true })
  subjectId?: string | null;

  @ApiProperty({ example: 'Serenity Spa & Wellness' })
  @Column()
  subjectName: string;

  @ApiProperty({ example: 'business_license' })
  @Column()
  documentType: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/docs/bl-biz3.pdf' })
  @Column({ nullable: true })
  documentUrl?: string;

  @ApiProperty({ enum: VerificationStatus, example: VerificationStatus.PENDING })
  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  @Index()
  status: VerificationStatus;

  @ApiPropertyOptional({ example: 'License valid until 2027' })
  @Column({ type: 'text', nullable: true })
  reviewNote?: string;

  @ApiPropertyOptional({ description: 'Reviewing admin user UUID' })
  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string | null;
}
