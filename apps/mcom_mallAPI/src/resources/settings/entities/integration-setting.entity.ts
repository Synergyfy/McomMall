import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

@Entity('integration_settings')
export class IntegrationSetting extends AbstractBaseEntity {
  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Index()
  business: Business;

  @Column({ default: false })
  googleConnected: boolean;

  @Column({ default: false })
  stripeConnected: boolean;

  @Column({ default: false })
  bookingsConnected: boolean;

  @Column({ type: 'text', nullable: true })
  googleProfileId?: string;

  @Column({ type: 'text', nullable: true })
  stripeAccountId?: string;
}
