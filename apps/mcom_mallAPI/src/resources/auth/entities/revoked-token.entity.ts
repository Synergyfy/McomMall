import { Entity, Column, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity('revoked_tokens')
export class RevokedToken extends AbstractBaseEntity {
  @Index()
  @Column()
  jti: string;

  @Column({ default: 'access' })
  tokenType: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
