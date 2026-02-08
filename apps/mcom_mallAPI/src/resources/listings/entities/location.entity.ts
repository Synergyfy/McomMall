import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ServiceModel } from '../listing.enum';
import { Business } from './listing.entity';

@Entity('locations')
export class Location extends AbstractBaseEntity {
  @Column()
  postcode: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2?: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ default: 'GB' })
  countryCode: string;

  @Column({ default: true })
  @IsBoolean()
  showPublicly: boolean;

  // For Product Sellers
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  deliveryRadiusKm?: number;

  // For Both
  @Column('text', { array: true, nullable: true })
  @IsOptional()
  servicePostcodes?: string[];

  // For Service Providers
  @Column({ type: 'enum', enum: ServiceModel, nullable: true })
  @IsOptional()
  @IsEnum(ServiceModel)
  serviceModel?: ServiceModel;

  @OneToOne(() => Business, (business) => business.location)
  @JoinColumn()
  business: Business;
}
