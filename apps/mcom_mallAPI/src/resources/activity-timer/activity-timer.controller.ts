import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ActivityTimerService } from './activity-timer.service';
import { CreateActivityTimerTemplateDto, UpdateActivityTimerTemplateDto } from './dto/activity-timer.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Request } from 'express';
import { ActivityTaskType, ActivityTimerType } from './enums/activity-task-type.enum';
import { ActivityTimerTemplate } from './entities/activity-timer-template.entity';
import { ActivityTimer } from './entities/activity-timer.entity';

@ApiTags('Activity Timer')
@ApiBearerAuth()
@Controller('activity-timer')
export class ActivityTimerController {
  constructor(private readonly timerService: ActivityTimerService) {}

  // --- Admin Endpoints ---

  @Post('templates')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new timer template (Admin)' })
  @ApiResponse({ status: 201, type: ActivityTimerTemplate })
  createTemplate(@Body() dto: CreateActivityTimerTemplateDto) {
    return this.timerService.createTemplate(dto);
  }

  @Get('templates')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all timer templates (Admin)' })
  @ApiResponse({ status: 200, type: [ActivityTimerTemplate] })
  getAllTemplates() {
    return this.timerService.findAllTemplates();
  }

  @Patch('templates/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a timer template (Admin)' })
  @ApiResponse({ status: 200, type: ActivityTimerTemplate })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateActivityTimerTemplateDto) {
    return this.timerService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a timer template (Admin)' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  removeTemplate(@Param('id') id: string) {
    return this.timerService.deleteTemplate(id);
  }

  // --- User Endpoints ---

  @Get('status')
  @ApiOperation({ summary: 'Get current user active timers (TRIAL & GENERAL)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns active timers with task-specific countdowns',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { enum: Object.values(ActivityTimerType) },
          name: { type: 'string' },
          description: { type: 'string' },
          remainingTime: { type: 'number', description: 'Global timer in ms' },
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                title: { type: 'string' },
                isCompleted: { type: 'boolean' },
                remainingTime: { type: 'number', description: 'Task timer in ms' },
                expiresAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  })
  getStatus(@Req() req: Request) {
    return this.timerService.getUserActiveTimer(req.user as any);
  }

  @Post('assign/:templateId')
  @ApiOperation({ summary: 'Assign a specific template to the current user' })
  @ApiResponse({ status: 201, type: ActivityTimer })
  assign(@Param('templateId') templateId: string, @Req() req: Request) {
    return this.timerService.assignTimerToUser(req.user as any, templateId);
  }

  @Post('pause')
  @ApiOperation({ summary: 'Pause current active timer' })
  @ApiResponse({ status: 201, type: ActivityTimer })
  pause(@Req() req: Request) {
    return this.timerService.pauseTimer(req.user['id']);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Resume current active timer' })
  @ApiResponse({ status: 201, type: ActivityTimer })
  resume(@Req() req: Request) {
    return this.timerService.resumeTimer(req.user['id']);
  }

  @Post('complete-task/:key')
  @ApiOperation({ summary: 'Mark a task as completed' })
  @ApiResponse({ status: 201, description: 'Task completed, returns updated status' })
  completeTask(@Param('key') key: string, @Req() req: Request) {
    return this.timerService.completeTask(req.user['id'], key);
  }
}
