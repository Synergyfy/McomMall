import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from 'src/resources/activities/entities/activity.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
  ) {}

  findAll() {
    return this.activitiesRepository.find({
      relations: [
        'user',
        'listing',
        'product',
        'service',
        'order',
        'booking',
        'promotion',
      ],
    });
  }
}
