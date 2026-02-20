import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActivityTimer } from './activity-timer.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_activities')
export class UserActivity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: () => User })
    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({ type: () => ActivityTimer })
    @ManyToOne(() => ActivityTimer)
    @JoinColumn({ name: 'activityId' })
    activity: ActivityTimer;

    @ApiProperty()
    @CreateDateColumn()
    completedAt: Date;
}
