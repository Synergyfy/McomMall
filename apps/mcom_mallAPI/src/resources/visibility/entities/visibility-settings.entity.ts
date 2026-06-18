import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from '../../listings/entities/listing.entity';

@Entity('visibility_settings')
export class VisibilitySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessId: string;

  @OneToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({ type: 'int', default: 5 })
  radius: number; // in miles

  @Column({ type: 'jsonb', default: [] })
  hubs: string[]; // e.g. ["Islington", "Hackney", "Camden"]

  @Column({ type: 'int', default: 3 })
  featuredDaysLeft: number;

  @Column({ type: 'jsonb', default: ["New Arrivals", "Best Sellers", "Seasonal Promo"] })
  rotatorOrder: string[];

  @Column({ default: false })
  highStreetMode: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
