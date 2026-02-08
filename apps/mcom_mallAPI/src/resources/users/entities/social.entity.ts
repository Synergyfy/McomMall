import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsUrl } from 'class-validator';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from './user.entity';

@Entity('socials')
export class Social extends AbstractBaseEntity {
  @Column({ nullable: true })
  @IsUrl()
  twitter?: string;

  @Column({ nullable: true })
  @IsUrl()
  facebook?: string;

  @Column({ nullable: true })
  @IsUrl()
  instagram?: string;

  @Column({ nullable: true })
  @IsUrl()
  linkedin?: string;

  @Column({ nullable: true })
  @IsUrl()
  youtube?: string;

  @OneToOne(() => User, (user) => user.socials)
  @JoinColumn()
  user: User;
}
