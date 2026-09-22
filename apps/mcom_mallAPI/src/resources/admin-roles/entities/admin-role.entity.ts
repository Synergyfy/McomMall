import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('admin_roles')
export class AdminRole extends AbstractBaseEntity {
  @ApiProperty({ example: 'Moderator', description: 'Unique role name' })
  @Column({ unique: true })
  @Index()
  name: string;

  @ApiPropertyOptional({ example: 'Review listings and run verifications' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: ['listings.review', 'verifications.manage'] })
  @Column({ type: 'simple-array', default: '' })
  permissions: string[];

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.adminRole)
  members: User[];
}
