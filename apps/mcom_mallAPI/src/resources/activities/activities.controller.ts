import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) { }

  @Get()
  async findAll(
    @Req() req: Request,
  ): Promise<{ message: string; date: Date }[]> {
    const activities = await this.activitiesService.findLast7Days(req.user.id);
    return activities.map((activity) => {
      let message = '';
      if (activity.action === 'deleted') {
        message = `You ${activity.action} a ${activity.target}`;
      } else {
        message = `You ${activity.action} a ${activity.target} called ${activity.targetName}`;
      }
      return {
        message,
        date: activity.created_at,
      };
    });
  };
}
