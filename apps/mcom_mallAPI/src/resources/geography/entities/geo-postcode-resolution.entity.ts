import { Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

/**
 * Cache of Central's resolved geographic hierarchy for a UK outward code.
 *
 * The marketplace backfill worker resolves each outcode once, stores the
 * result here and then updates every business in that outcode. This keeps
 * Central traffic proportional to the number of outcodes (a few thousand),
 * not the number of businesses, and makes re-runs cheap.
 */
@Entity('geo_postcode_resolutions')
export class GeoPostcodeResolution extends AbstractBaseEntity {
  @Column()
  outcode: string;

  /** A representative full postcode used for the lookup. */
  @Column({ nullable: true })
  postcode?: string | null;

  @Column({ name: 'city_id', nullable: true })
  cityId?: string | null;

  @Column({ name: 'city_name', nullable: true })
  cityName?: string | null;

  @Column({ name: 'borough_id', nullable: true })
  boroughId?: string | null;

  @Column({ name: 'borough_name', nullable: true })
  boroughName?: string | null;

  @Column({ name: 'high_street_id', nullable: true })
  highStreetId?: string | null;

  @Column({ name: 'high_street_name', nullable: true })
  highStreetName?: string | null;

  @Column({ name: 'local_mall_id', nullable: true })
  localMallId?: string | null;

  @Column({ name: 'local_mall_name', nullable: true })
  localMallName?: string | null;

  @Column('double precision', { nullable: true })
  latitude?: number | null;

  @Column('double precision', { nullable: true })
  longitude?: number | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date | null;
}
