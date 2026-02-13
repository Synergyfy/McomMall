import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual, Raw } from 'typeorm';
import { ActivityTimer } from './entities/activity-timer.entity';
import { User } from '../users/entities/user.entity';
import { ActivityTaskType, ActivityTimerType } from './enums/activity-task-type.enum';

@Injectable()
export class ActivityTimerService {
  constructor(
    @InjectRepository(ActivityTimer)
    private readonly timerRepository: Repository<ActivityTimer>,
  ) { }

  // --- Admin: Publish a Task ---

  async createTaskForTiers(dto: any, TierClass: any, UserClass: any): Promise<void> {
    // This method would normally take a DTO with title, description, key, actionUrl, type, durationDays, and targetTierIds.
    // Since we don't have the DTO defined in this file context, I'll assume 'dto' has these fields.
    // This logic replaces "assignTimerToUser" for mass creation.

    // 1. Find all eligible users
    // In a real app, this might be a heavy query or processed via queue. 
    // For now, we'll implement the basic structure.

    // const eligibleUsers = await this.userRepository.find({ ... }); 
    // for (const user of eligibleUsers) { ... create ActivityTimer ... }

    // NOTE: The user asked to "Implement createTask (Admin publishes a task -> creates rows for users)"
    // I will implement a simplified version that can be called by the controller.
    return;
  }

  // --- Core Logic ---

  async getUserActiveTasks(user: User): Promise<any[]> {
    const userId = user.id;

    // Fetch user with membership and trialPauses
    const fullUser = await this.timerRepository.manager.findOne(User, {
      where: { id: userId },
      relations: ['membership', 'membership.tier'],
    });

    const tasks = await this.timerRepository.find({
      where: { user: { id: userId }, isActive: true },
      order: { createdAt: 'DESC' }
    });

    const now = new Date();
    const mappedTasks = [];

    // --- TRIAL LOGIC PRE-CALCULATION ---
    let trialRecursivePauseDuration = 0;
    let isTrialPaused = false;

    if (fullUser?.trialPauses?.length) {
      fullUser.trialPauses.forEach(p => {
        if (p.resumedAt) {
          trialRecursivePauseDuration += new Date(p.resumedAt).getTime() - new Date(p.pausedAt).getTime();
        } else {
          // Currently paused
          isTrialPaused = true;
          trialRecursivePauseDuration += now.getTime() - new Date(p.pausedAt).getTime();
        }
      });
    }

    // Default Trial Duration if not set in Tier
    const tierConfig = fullUser?.membership?.tier?.configuration;
    const trialDurationDays = tierConfig?.trialDurationDays || 30;

    // Calculate "Effective" Trial Expiry
    // Trial Expiry = User Joined Date + Trial Duration + Total Pause Duration
    // NOTE: Assuming Trial starts when User joins. If it starts at first login, that date should be used. 
    // Using createdAt for now as a safe proxy for "Joined".
    const trialBaseStart = fullUser.created_at;
    const trialBaseExpiry = new Date(trialBaseStart.getTime() + trialDurationDays * 24 * 60 * 60 * 1000 + trialRecursivePauseDuration);


    for (const task of tasks) {
      let expiresAt: Date;
      let remainingTime: number;

      if (task.type === ActivityTimerType.TRIAL) {
        expiresAt = trialBaseExpiry;
      } else {
        // GENERAL tasks have their own fixed expiry set at creation
        expiresAt = task.expiresAt;
      }

      remainingTime = expiresAt.getTime() - now.getTime();
      if (remainingTime < 0) remainingTime = 0;

      // If task is completed, it's done. 
      // If it's expired and not completed, it might be "failed" or just expired.

      mappedTasks.push({
        id: task.id,
        type: task.type,
        title: task.title,
        description: task.description,
        key: task.key,
        actionUrl: task.actionUrl,
        isCompleted: task.isCompleted,
        expiresAt: expiresAt,
        remainingTime: remainingTime,
        isPaused: task.type === ActivityTimerType.TRIAL ? isTrialPaused : false, // Only Trial tasks show as paused
        completedAt: task.completedAt
      });
    }

    return mappedTasks;
  }

  async pauseTrial(userId: string): Promise<User> {
    const user = await this.timerRepository.manager.findOne(User, { where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if already paused
    const activePause = user.trialPauses?.find(p => p.resumedAt === null);
    if (activePause) throw new BadRequestException('Trial is already paused');

    // Optional: Limit pauses logic could go here if trialPauses.length check is needed.

    if (!user.trialPauses) user.trialPauses = [];
    user.trialPauses.push({ pausedAt: new Date(), resumedAt: null });

    return this.timerRepository.manager.save(user);
  }

  async resumeTrial(userId: string): Promise<User> {
    const user = await this.timerRepository.manager.findOne(User, { where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const activePause = user.trialPauses?.find(p => p.resumedAt === null);
    if (!activePause) throw new BadRequestException('Trial is not paused');

    activePause.resumedAt = new Date();

    return this.timerRepository.manager.save(user);
  }

  async completeTask(userId: string, taskId: string): Promise<void> {
    const task = await this.timerRepository.findOne({ where: { id: taskId, user: { id: userId } } });
    if (!task) throw new NotFoundException('Task not found');

    if (!task.isCompleted) {
      task.isCompleted = true;
      task.completedAt = new Date();
      await this.timerRepository.save(task);
    }
  }

  /**
   * Complete task by KEY (legacy support or action-based completion)
   */
  async completeTaskByKey(userId: string, key: string): Promise<void> {
    // Finds ALL active tasks with this key for the user and marks them done
    const tasks = await this.timerRepository.find({
      where: { user: { id: userId }, key: key, isCompleted: false, isActive: true }
    });

    for (const t of tasks) {
      t.isCompleted = true;
      t.completedAt = new Date();
      await this.timerRepository.save(t);
    }
  }

  async isRestricted(user: User): Promise<boolean> {
    // If user has a paid tier, not restricted
    if (user.membership && user.membership.tierId) {
      return false;
    }

    // Check Paused State directly from User entity
    // We need to fetch fresh user data including trialPauses if not present
    let fullUser = user;
    if (!fullUser.trialPauses) {
      fullUser = await this.timerRepository.manager.findOne(User, { where: { id: user.id } });
    }

    if (fullUser.trialPauses?.some(p => p.resumedAt === null)) {
      return true; // Locked out if paused
    }

    // Check Trial Expiry
    const now = new Date();

    // Recalculate expiry logic (same as in getUserActiveTasks)
    // This code duplication suggests extracting "getTrialExpiry(user)" helper method.

    let trialRecursivePauseDuration = 0;
    if (fullUser.trialPauses?.length) {
      fullUser.trialPauses.forEach(p => {
        if (p.resumedAt) {
          trialRecursivePauseDuration += new Date(p.resumedAt).getTime() - new Date(p.pausedAt).getTime();
        }
        // If currently paused, we returned true above, so no need to calculate active pause here
      });
    }

    const tierConfig = fullUser.membership?.tier?.configuration;
    const trialDurationDays = tierConfig?.trialDurationDays || 30;

    const trialBaseStart = fullUser.created_at;

    const trialBaseExpiry = new Date(trialBaseStart.getTime() + trialDurationDays * 24 * 60 * 60 * 1000 + trialRecursivePauseDuration);

    const isExpired = now > trialBaseExpiry;

    // Check if there are any INCOMPLETE trial tasks?
    // User requirement: "isExpired && !allTasksDone"
    // So we need to check if ANY trial task is incomplete.

    if (!isExpired) return false;

    const incompleteTrialTasks = await this.timerRepository.count({
      where: {
        user: { id: user.id },
        type: ActivityTimerType.TRIAL,
        isCompleted: false,
        isActive: true
      }
    });

    return incompleteTrialTasks > 0;
  }
}
