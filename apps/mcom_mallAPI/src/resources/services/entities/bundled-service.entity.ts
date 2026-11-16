import { Column, Entity, ManyToOne, Index, DeleteDateColumn } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Service } from './service.entity';
import { Length } from 'class-validator';

@Entity('bundled_services')
export class BundledService extends AbstractBaseEntity {
  id: string;

  @ManyToOne(() => Service, (service) => service.bundledServices, {
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

  @DeleteDateColumn()
  deletedAt?: Date;
}
