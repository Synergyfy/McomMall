import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AssetCategory } from './asset-category.entity';

@Entity('gift_card_assets')
export class GiftCardAsset extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column()
  url: string;

  @ManyToMany(() => AssetCategory, (category) => category.assets, {
    cascade: true,
  })
  @JoinTable({
    name: 'gift_card_asset_categories',
    joinColumn: { name: 'assetId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: AssetCategory[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;
}
