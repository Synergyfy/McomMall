import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ActivityTimerType } from '../enums/activity-task-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('activity_timer_definitions')
export class ActivityTimerDefinition {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty({ nullable: true })
    @Column({ type: 'text', nullable: true })
    description: string;

    @ApiProperty({ enum: ActivityTimerType })
    @Column({
        type: 'enum',
        enum: ActivityTimerType,
        default: ActivityTimerType.GENERAL
    })
    type: ActivityTimerType;

    @ApiProperty()
    @Column()
    key: string;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    actionUrl: string;

    @ApiProperty({ nullable: true })
    @Column({ type: 'simple-array', nullable: true }) // Store tier IDs as comma-separated string
    targetTierIds: string[];

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    durationDays: number;

    @ApiProperty({ nullable: true })
    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}
