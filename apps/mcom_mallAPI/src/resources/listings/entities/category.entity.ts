import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Business } from './listing.entity';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity('categories')
export class Category extends AbstractBaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  // @ManyToMany(() => Business, (business) => business.categories)
  // businesses: Business[];
}
