import { User } from './../../users/entities/user.entity';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

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
}