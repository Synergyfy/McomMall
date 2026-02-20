import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Coupon } from './coupon.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('saved_coupons')
@Index(['user', 'coupon'], { unique: true })
export class SavedCoupon {
    @ApiProperty({ format: 'uuid' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: () => User })
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({ type: () => Coupon })
    @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'couponId' })
    coupon: Coupon;

    @ApiProperty()
    @CreateDateColumn()
    savedAt: Date;
}
