import { IsUrl } from 'class-validator';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ServiceProviderProfile } from '../../service-provider-profile/entities/service-provider-profile.entity';

@Entity('certifications')
export class Certification extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column()
  @IsUrl()
  fileUrl: string; // URL to the uploaded PDF/JPG

  @ManyToOne(() => ServiceProviderProfile, (profile) => profile.certifications)
  serviceProviderProfile: ServiceProviderProfile;
}
