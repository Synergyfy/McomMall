import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

@Entity('rotators')
export class Rotator extends AbstractBaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ default: 'product' })
  rotatorType: string; // 'product' | 'promotion' | 'event' | 'borough' | 'featured'

  @Column({ type: 'int', default: 5 })
  rotationSpeed: number; // in seconds

  @Column({ default: 'medium' })
  priority: string; // 'low' | 'medium' | 'high'

  @Column({ default: 'public' })
  visibility: string; // 'public' | 'private' | 'restricted'

  @Column({ nullable: true })
  boroughTarget?: string;

  @Column({ nullable: true })
  storefrontTarget?: string;

  @Column('simple-json', { nullable: true })
  contentIds: string[]; // array of product / promotion / event IDs

  @Column({ default: 'active' })
  status: string; // 'active' | 'scheduled' | 'draft' | 'archived'

  @Column()
  businessId: string;

  @ManyToOne(() => Business, (business) => business.rotators, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business: Business;
}
