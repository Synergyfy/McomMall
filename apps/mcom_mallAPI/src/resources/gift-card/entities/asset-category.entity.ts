import { Entity, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { GiftCardAsset } from './gift-card-asset.entity';

@Entity('asset_categories')
export class AssetCategory extends AbstractBaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @ManyToMany(() => GiftCardAsset, (asset) => asset.categories)
  assets: GiftCardAsset[];
}
