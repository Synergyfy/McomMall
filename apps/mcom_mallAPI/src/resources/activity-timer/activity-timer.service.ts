import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual, Raw } from 'typeorm';
import { ActivityTimerTemplate } from './entities/activity-timer-template.entity';
import { ActivityTimer } from './entities/activity-timer.entity';
import { CreateActivityTimerTemplateDto, UpdateActivityTimerTemplateDto } from './dto/activity-timer.dto';
import { User } from '../users/entities/user.entity';
import { ActivityTaskType, ActivityTimerType } from './enums/activity-task-type.enum';

@Injectable()
export class ActivityTimerService {
  constructor(
    @InjectRepository(ActivityTimerTemplate)
    private readonly templateRepository: Repository<ActivityTimerTemplate>,
    @InjectRepository(ActivityTimer)
    private readonly timerRepository: Repository<ActivityTimer>,
  ) { }

  // --- Template Management (Admin) ---

  async createTemplate(dto: CreateActivityTimerTemplateDto): Promise<ActivityTimerTemplate> {
    const template = this.templateRepository.create(dto);
    return this.templateRepository.save(template);
  }

  async updateTemplate(id: string, dto: UpdateActivityTimerTemplateDto): Promise<ActivityTimerTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  async findAllTemplates(): Promise<ActivityTimerTemplate[]> {
    return this.templateRepository.find({ order: { createdAt: 'DESC' } });
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    await this.timerRepository.delete({ template: { id } });
    await this.templateRepository.remove(template);
  }

  // --- Core Logic ---

  /**
   * Called by various services when a user performs an action.
   * Marks matching tasks as done for all active timers.
   */
  async handleAction(userId: string, actionType: ActivityTaskType): Promise<void> {
    const activeTimers = await this.timerRepository.find({
      where: { user: { id: userId }, isActive: true },
      relations: ['template']
    });

    for (const timer of activeTimers) {
      if (timer.taskStatus[actionType] === false) {
        timer.taskStatus[actionType] = true;

        // Check if all tasks are done
        const allDone = Object.values(timer.taskStatus).every(val => val === true);
        if (allDone) {
          timer.completedAt = new Date();
        }

        await this.timerRepository.save(timer);
      }
    }
  }

  /**
   * Check if a user's access should be restricted due to expired trial with incomplete tasks.
   */
  async isRestricted(user: User): Promise<boolean> {
    // If user has a paid tier, they are not restricted by trial
    if (user.membership && user.membership.tierId) {
      return false;
    }

    const trialTimer = await this.timerRepository.findOne({
      where: { user: { id: user.id }, type: ActivityTimerType.TRIAL, isActive: true },
      order: { createdAt: 'DESC' }
    });

    if (!trialTimer) return false;

    const now = new Date();
    const isExpired = now > trialTimer.expiresAt;
    const allTasksDone = Object.values(trialTimer.taskStatus).every(val => val === true);

    return isExpired && !allTasksDone;
  }

  async getUserActiveTimer(user: User): Promise<any[]> {
    const userId = user.id;
    const userTierId = user.membership?.tierId;

    // 1. Sync Trial Timer for new users without tier
    if (!userTierId) {
      const activeTrial = await this.timerRepository.findOne({
        where: { user: { id: userId }, type: ActivityTimerType.TRIAL, isActive: true }
      });

      if (!activeTrial) {
        const latestTrialTemplate = await this.templateRepository.findOne({
          where: { type: ActivityTimerType.TRIAL, isPublished: true },
          order: { createdAt: 'DESC' }
        });

        if (latestTrialTemplate) {
          await this.assignTimerToUser(user, latestTrialTemplate.id);
        }
      }
    }

    // 2. Sync General Timers based on Tier
    const now = new Date();
    const eligibleGeneralTemplates = await this.templateRepository.find({
      where: [
        { type: ActivityTimerType.GENERAL, isPublished: true, isForAllTiers: true },
        {
          type: ActivityTimerType.GENERAL,
          isPublished: true,
          includedTierIds: Raw((alias) => `${alias} @> :tiers`, {
            tiers: JSON.stringify([userTierId || 'none']),
          }),
        },
      ],
    });

    for (const template of eligibleGeneralTemplates) {
      // Check if within time window
      if (template.startTime && now < template.startTime) continue;
      if (template.endTime && now > template.endTime) continue;

      const existing = await this.timerRepository.findOne({
        where: { user: { id: userId }, template: { id: template.id } }
      });

      if (!existing) {
        await this.assignTimerToUser(user, template.id);
      }
    }

    // 3. Fetch all active timers
    const timers = await this.timerRepository.find({
      where: { user: { id: userId }, isActive: true },
      relations: ['template'],
      order: { type: 'ASC', createdAt: 'DESC' }
    });

    return timers.map(timer => {
      let remainingTime = timer.expiresAt.getTime() - now.getTime();
      if (remainingTime < 0) remainingTime = 0;

      return {
        id: timer.id,
        type: timer.type,
        name: timer.template.name,
        description: timer.template.description,
        remainingTime,
        tasks: timer.template.tasks.map(t => ({
          ...t,
          isCompleted: !!timer.taskStatus[t.key]
        })),
        isPaused: timer.pauses.some(p => p.resumedAt === null),
        pauses: timer.pauses,
        expiresAt: timer.expiresAt,
        completedAt: timer.completedAt
      };
    });
  }

  async assignTimerToUser(user: User, templateId: string): Promise<ActivityTimer> {
    const template = await this.templateRepository.findOne({ where: { id: templateId, isPublished: true } });
    if (!template) throw new NotFoundException('Published template not found');

    const timer = new ActivityTimer();
    timer.user = user;
    timer.template = template;
    timer.type = template.type;
    timer.startedAt = new Date();
    timer.expiresAt = new Date(timer.startedAt.getTime() + template.durationDays * 24 * 60 * 60 * 1000);

    timer.taskStatus = {};
    template.tasks.forEach(task => {
      timer.taskStatus[task.key] = false;
    });

    return this.timerRepository.save(timer);
  }

  async pauseTimer(userId: string): Promise<ActivityTimer> {
    const timer = await this.timerRepository.findOne({ where: { user: { id: userId }, isActive: true } });
    if (!timer) throw new NotFoundException('Active timer not found');

    const activePause = timer.pauses.find(p => p.resumedAt === null);
    if (activePause) throw new BadRequestException('Timer is already paused');

    timer.pauses.push({ pausedAt: new Date(), resumedAt: null });
    return this.timerRepository.save(timer);
  }

  async resumeTimer(userId: string): Promise<ActivityTimer> {
    const timer = await this.timerRepository.findOne({ where: { user: { id: userId }, isActive: true } });
    if (!timer) throw new NotFoundException('Active timer not found');

    const activePause = timer.pauses.find(p => p.resumedAt === null);
    if (!activePause) throw new BadRequestException('Timer is not paused');

    activePause.resumedAt = new Date();
    const pauseDuration = activePause.resumedAt.getTime() - new Date(activePause.pausedAt).getTime();
    timer.expiresAt = new Date(timer.expiresAt.getTime() + pauseDuration);

    return this.timerRepository.save(timer);
  }

  async completeTask(userId: string, taskKey: ActivityTaskType): Promise<ActivityTimer[]> {
    await this.handleAction(userId, taskKey);
    // Return fresh list after action
    const user = await this.timerRepository.manager.findOne(User, {
      where: { id: userId },
      relations: ['membership']
    });
    return this.getUserActiveTimer(user);
  }
}
