import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { AdPlacement, CampaignType } from '../campaign.enum';

@Entity('campaigns')
export class Campaign extends AbstractBaseEntity {
  @ManyToOne(() => Business, (business) => business.campaigns)
  business: Business;

  @Column({
    type: 'enum',
    enum: CampaignType,
  })
  type: CampaignType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  @Column()
  budget: number;

  @Column({ nullable: true })
  displayOnlyIfCategory?: string;

  @Column({ nullable: true })
  displayOnlyIfRegion?: string;

  @Column({ default: false })
  enabledForLoggedInUser: boolean;

  @Column({
    type: 'enum',
    enum: AdPlacement,
    array: true,
  })
  adPlacement: AdPlacement[];
}
