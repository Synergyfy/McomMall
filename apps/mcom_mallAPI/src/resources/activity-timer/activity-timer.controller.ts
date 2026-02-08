import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityTimerService } from './activity-timer.service';
import { CreateActivityTimerTemplateDto, UpdateActivityTimerTemplateDto } from './dto/activity-timer.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { Request } from 'express';
import { ActivityTaskType } from './enums/activity-task-type.enum';

@ApiTags('Activity Timer')
@ApiBearerAuth()
@Controller('activity-timer')
export class ActivityTimerController {
  constructor(private readonly timerService: ActivityTimerService) {}

  // --- Admin Endpoints ---

  @Post('templates')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new timer template (Admin)' })
  createTemplate(@Body() dto: CreateActivityTimerTemplateDto) {
    return this.timerService.createTemplate(dto);
  }

  @Get('templates')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all timer templates (Admin)' })
  getAllTemplates() {
    return this.timerService.findAllTemplates();
  }

  @Patch('templates/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a timer template (Admin)' })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateActivityTimerTemplateDto) {
    return this.timerService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a timer template (Admin)' })
  removeTemplate(@Param('id') id: string) {
    return this.timerService.deleteTemplate(id);
  }

  // --- User Endpoints ---

  @Get('status')
  @ApiOperation({ summary: 'Get current user active timers (TRIAL & GENERAL)' })
  getStatus(@Req() req: Request) {
    return this.timerService.getUserActiveTimer(req.user as any);
  }

  @Post('assign/:templateId')
  @ApiOperation({ summary: 'Assign a specific template to the current user' })
  assign(@Param('templateId') templateId: string, @Req() req: Request) {
    return this.timerService.assignTimerToUser(req.user as any, templateId);
  }

  @Post('pause')
  @ApiOperation({ summary: 'Pause current active timer' })
  pause(@Req() req: Request) {
    return this.timerService.pauseTimer(req.user['id']);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Resume current active timer' })
  resume(@Req() req: Request) {
    return this.timerService.resumeTimer(req.user['id']);
  }

  @Post('complete-task/:key')
  @ApiOperation({ summary: 'Mark a task as completed' })
  completeTask(@Param('key') key: ActivityTaskType, @Req() req: Request) {
    return this.timerService.completeTask(req.user['id'], key);
  }
}
