import { User } from './../../users/entities/user.entity';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';
import { Business } from '../../listings/entities/listing.entity';
import { Certification } from '../../listings/entities/certifications.entity';

@Entity('service_provider_profiles')
export class ServiceProviderProfile extends AbstractBaseEntity {
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column({ nullable: true })
  serviceArea: string;

  @Column('simple-array', { nullable: true })
  portfolio: string[];

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  bookingUrl?: string;

  // Pricing Model
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedPriceFrom?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateFrom?: number;

  @Column({ default: false })
  @IsBoolean()
  quoteOnly: boolean;

  // Insurance
  @Column({ default: false })
  @IsBoolean()
  hasPublicLiabilityInsurance: boolean;

  @Column({ nullable: true })
  @IsOptional()
  insuranceProvider?: string;

  @Column('date', { nullable: true })
  @IsOptional()
  @IsDate()
  insuranceExpiryDate?: Date;

  @OneToOne(() => Business, (business) => business.serviceProviderProfile)
  @JoinColumn()
  business: Business;

  @OneToMany(() => Certification, (cert) => cert.serviceProviderProfile, {
    cascade: true,
  })
  certifications: Certification[];
}
