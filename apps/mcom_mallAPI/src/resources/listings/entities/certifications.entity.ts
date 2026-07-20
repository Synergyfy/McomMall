import { IsUrl } from 'class-validator';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BusinessServiceProviderProfile } from './service_provider_profiles.entity';

@Entity('certifications')
export class Certification extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column()
  @IsUrl()
  fileUrl: string; // URL to the uploaded PDF/JPG

  @ManyToOne(
    () => BusinessServiceProviderProfile,
    (profile) => profile.certifications,
  )
  serviceProviderProfile: BusinessServiceProviderProfile;
}
