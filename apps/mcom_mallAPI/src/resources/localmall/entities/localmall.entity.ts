import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Business } from '../../listings/entities/listing.entity';

@Entity('local_malls')
export class LocalMall extends AbstractBaseEntity {
  @Column({ unique: true })
  name: string; // e.g., "Southwark Local Mall"

  @Column('double precision', { nullable: true })
  latitude?: number;

  @Column('double precision', { nullable: true })
  longitude?: number;

  @OneToMany(() => Business, (business) => business.localMall)
  businesses: Business[];
}
