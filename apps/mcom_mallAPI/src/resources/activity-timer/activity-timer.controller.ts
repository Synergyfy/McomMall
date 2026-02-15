import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ActivityTimerService } from './activity-timer.service';
import { PublishTaskDto } from './dto/activity-timer.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Request } from 'express';
import { ActivityTaskType, ActivityTimerType } from './enums/activity-task-type.enum';
import { ActivityTimer } from './entities/activity-timer.entity';

@ApiTags('Activity Timer')
@ApiBearerAuth()
@Controller('activity-timer')
export class ActivityTimerController {
  constructor(private readonly timerService: ActivityTimerService) { }

  // --- Admin Endpoints ---

  @Post('admin/publish')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Publish a new Activity Timer Definition (Admin)' })
  @ApiResponse({ status: 201, description: 'Task published successfully', type: ActivityTimer })
  publishTask(@Body() dto: PublishTaskDto) {
    return this.timerService.createActivity(dto);
  }

  @Get('admin/definitions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all published task definitions (Admin)' })
  @ApiResponse({ status: 200, description: 'List of definitions', type: [ActivityTimer] })
  getDefinitions() {
    return this.timerService.findAllActivities();
  }

  // --- User Endpoints ---

  @Get('status')
  @ApiOperation({ summary: 'Get current user active tasks (TRIAL & GENERAL)' })
  @ApiResponse({
    status: 200,
    description: 'Returns active tasks with detailed status',
    type: [ActivityTimer]
  })
  getStatus(@Req() req: Request) {
    return this.timerService.getUserActiveTasks(req.user as any);
  }

  @Post('pause')
  @ApiOperation({ summary: 'Pause Trial Timer (Trial users only)' })
  @ApiResponse({ status: 201, description: 'Trial paused' })
  pause(@Req() req: Request) {
    return this.timerService.pauseTrial(req.user['id']);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Resume Trial Timer (Trial users only)' })
  @ApiResponse({ status: 201, description: 'Trial resumed' })
  resume(@Req() req: Request) {
    return this.timerService.resumeTrial(req.user['id']);
  }

  @Post('complete-task/:key')
  @ApiOperation({ summary: 'Mark a task as completed by Key' })
  @ApiResponse({ status: 201, description: 'Task completed' })
  completeTask(@Param('key') key: string, @Req() req: Request) {
    return this.timerService.completeTaskByKey(req.user['id'], key);
  }
}
