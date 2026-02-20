import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum HelpRequestType {
  PRODUCT_CREATION = 'PRODUCT_CREATION',
  PRODUCT_EDIT = 'PRODUCT_EDIT',
  PRODUCT_VARIATION_SETUP = 'PRODUCT_VARIATION_SETUP',
  INVENTORY_MANAGEMENT = 'INVENTORY_MANAGEMENT',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  STORE_DESIGN = 'STORE_DESIGN',
  PROMOTION_SETUP = 'PROMOTION_SETUP',
  CUSTOMER_SERVICE_HELP = 'CUSTOMER_SERVICE_HELP',
  TERMINAL_CASHBACK_SETUP = 'TERMINAL_CASHBACK_SETUP',
  GENERAL_SUPPORT = 'GENERAL_SUPPORT',
}

@Entity('help_requests')
export class HelpRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requesterId: string; // The User ID (Owner/Seller)

  @Column({ type: 'enum', enum: HelpRequestType })
  type: HelpRequestType;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
