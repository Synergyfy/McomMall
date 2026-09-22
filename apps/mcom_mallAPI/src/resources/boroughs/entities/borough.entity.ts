import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { BoroughCampaign } from '../../visibility/entities/borough-campaign.entity';

@Entity('boroughs')
export class Borough extends AbstractBaseEntity {
  @ApiProperty({ example: 'Camden', description: 'Unique borough name' })
  @Column({ unique: true })
  @Index()
  name: string;

  @ApiPropertyOptional({ example: 'High', description: 'Population activity level' })
  @Column({ nullable: true })
  activityLevel?: string;

  @ApiPropertyOptional({ example: 'Sarah Chen', description: 'Assigned borough manager' })
  @Column({ nullable: true })
  managerName?: string;

  @ApiProperty({ example: true, description: 'Whether the borough is active' })
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => BoroughCampaign, (campaign) => campaign.borough)
  campaigns: BoroughCampaign[];
}
