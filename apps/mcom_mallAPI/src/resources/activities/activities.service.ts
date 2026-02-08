import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(
    user: User,
    action: string,
    target: string,
    targetName: string,
  ): Promise<Activity> {
    const activity = this.activityRepository.create({
      user,
      action,
      target,
      targetName,
    });
    return this.activityRepository.save(activity);
  }

  async findLast7Days(userId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      take: 7,
    });
  }
}
