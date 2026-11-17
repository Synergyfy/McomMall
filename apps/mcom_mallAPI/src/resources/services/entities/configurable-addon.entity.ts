import { Column, Entity, ManyToOne, Index, DeleteDateColumn } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Service } from './service.entity';
import { AddonPricingType } from '../service.enum';
import { Length } from 'class-validator';

@Entity('configurable_addons')
export class ConfigurableAddon extends AbstractBaseEntity {
  id: string;

  @ManyToOne(() => Service, (service) => service.configurableAddons, {
    onDelete: 'CASCADE',
  })
  @Index()
  service: Service;

  @Column()
  serviceId: string;

  @Column({ length: 160 })
  @Length(1, 160)
  name: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  price: number;

  @Column({
    type: 'enum',
    enum: AddonPricingType,
  })
  pricingType: AddonPricingType;

  @Column({ length: 50, nullable: true })
  @Length(1, 50)
  unitName?: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
