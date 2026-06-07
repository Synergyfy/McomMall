import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('activated_regions')
export class ActivatedRegion extends AbstractBaseEntity {
  @Column({ unique: true })
  name: string; // e.g., "Southwark", "Camden", "Birmingham"

  @Column({ default: true })
  isActive: boolean;
}
