import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('shipping_addresses')
export class ShippingAddress extends AbstractBaseEntity {
  @Column()
  addressName: string; // e.g., "Home", "Office"

  @Column()
  recipientName: string;

  @Column()
  phoneNumber: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ default: false })
  isMain: boolean;

  @ManyToOne(() => User, (user) => user.shippingAddresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
