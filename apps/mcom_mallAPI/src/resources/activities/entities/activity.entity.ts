import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('activities')
export class Activity extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @Column()
  action: string;

  @Column()
  target: string;

  @Column()
  targetName: string;
}
