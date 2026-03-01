import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityTimer } from './entities/activity-timer.entity';
import { UserActivity } from './entities/user-activity.entity';
import { User } from '../users/entities/user.entity';
import { ActivityTimerType } from './enums/activity-task-type.enum';

@Injectable()
export class ActivityTimerService {
  constructor(
    @InjectRepository(ActivityTimer)
    private readonly activityRepository: Repository<ActivityTimer>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

  // --- Admin: Publish a Task (Create Definition) ---

  async createActivity(dto: any): Promise<ActivityTimer> {
    const {
      title,
      description,
      key,
      actionUrl,
      type,
      durationDays,
      includedTierIds,
      excludedTierIds,
      expiresAt,
    } = dto;

    const activity = this.activityRepository.create({
      title,
      description,
      key,
      actionUrl,
      type,
      durationDays,
      includedTierIds,
      excludedTierIds,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
    });

    return this.activityRepository.save(activity);
  }

  // --- Admin: List Definitions ---

  async findAllActivities(): Promise<ActivityTimer[]> {
    return this.activityRepository
      .createQueryBuilder('ActivityTimer')
      .select([
        'ActivityTimer.id',
        'ActivityTimer.type',
        'ActivityTimer.title',
        'ActivityTimer.description',
        'ActivityTimer.key',
        'ActivityTimer.actionUrl',
        'ActivityTimer.includedTierIds',
        'ActivityTimer.excludedTierIds',
        'ActivityTimer.durationDays',
        'ActivityTimer.createdAt',
        'ActivityTimer.expiresAt',
        'ActivityTimer.isActive',
      ])
      .orderBy('ActivityTimer.createdAt', 'DESC')
      .getMany();
  }

  async updateActivity(id: string, dto: any): Promise<ActivityTimer> {
    const activity = await this.activityRepository.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException(`Activity timer with ID ${id} not found`);
    }

    const { expiresAt, ...rest } = dto;

    // Explicitly handle expiresAt if present, otherwise merge others
    if (expiresAt !== undefined) {
      activity.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    Object.assign(activity, rest);

    return this.activityRepository.save(activity);
  }

  async deleteActivity(id: string): Promise<void> {
    const activity = await this.activityRepository.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException(`Activity timer with ID ${id} not found`);
    }
    await this.activityRepository.remove(activity);
  }

  // --- Core Logic ---

  async getUserActiveTasks(user: User): Promise<any[]> {
    const userId = user.id;

    // 1. Fetch user with membership
    const fullUser = await this.activityRepository.manager.findOne(User, {
      where: { id: userId },
      relations: ['membership', 'membership.tier'],
    });

    // 2. Fetch all relevant Activities
    const allActivities = await this.activityRepository
      .createQueryBuilder('ActivityTimer')
      .select([
        'ActivityTimer.id',
        'ActivityTimer.type',
        'ActivityTimer.title',
        'ActivityTimer.description',
        'ActivityTimer.key',
        'ActivityTimer.actionUrl',
        'ActivityTimer.includedTierIds',
        'ActivityTimer.excludedTierIds',
        'ActivityTimer.durationDays',
        'ActivityTimer.createdAt',
        'ActivityTimer.expiresAt',
        'ActivityTimer.isActive',
      ])
      .where('ActivityTimer.isActive = :isActive', { isActive: true })
      .orderBy('ActivityTimer.createdAt', 'DESC')
      .getMany();

    const userTierId = fullUser?.membership?.tierId;

    const eligibleActivities = allActivities.filter((activity) => {
      // 1. Inclusion Check
      let isIncluded = false;
      // If no specific tiers included, it applies to all (unless excluded)
      if (!activity.includedTierIds || activity.includedTierIds.length === 0) {
        isIncluded = true;
      } else if (userTierId && activity.includedTierIds.includes(userTierId)) {
        isIncluded = true;
      }

      // 2. Exclusion Check
      let isExcluded = false;
      if (
        userTierId &&
        activity.excludedTierIds &&
        activity.excludedTierIds.includes(userTierId)
      ) {
        isExcluded = true;
      }

      return isIncluded && !isExcluded;
    });

    // 3. Fetch User's Completions
    const userCompletions = await this.userActivityRepository
      .createQueryBuilder('UserActivity')
      .leftJoinAndSelect('UserActivity.activity', 'activity')
      .where('UserActivity.userId = :userId', { userId })
      .select([
        'UserActivity.id',
        'UserActivity.completedAt',
        'activity.id',
        'activity.key',
      ])
      .getMany();

    const completedActivityIds = new Set(
      userCompletions.map((ua) => ua.activity.id),
    );
    const completionMap = new Map<string, Date>();
    userCompletions.forEach((ua) =>
      completionMap.set(ua.activity.id, ua.completedAt),
    );

    const now = new Date();
    const membership = fullUser?.membership;

    const response = [];
    const activitiesByType = new Map<ActivityTimerType, ActivityTimer[]>();

    for (const activity of eligibleActivities) {
      if (!activitiesByType.has(activity.type))
        activitiesByType.set(activity.type, []);
      activitiesByType.get(activity.type).push(activity);
    }

    // Handle TRIAL Users
    if (membership && membership.isTrial && membership.isActive) {
      const trialActivities =
        activitiesByType.get(ActivityTimerType.TRIAL) || [];
      const bothActivities = activitiesByType.get(ActivityTimerType.BOTH) || [];
      const allTrialActivities = [...trialActivities, ...bothActivities];

      if (allTrialActivities.length > 0) {
        const trialExpiry = new Date(membership.expiresAt);
        const remainingTime = Math.max(
          0,
          trialExpiry.getTime() - now.getTime(),
        );

        response.push({
          id: `trial-timer-${userId}`,
          type: ActivityTimerType.TRIAL,
          name: 'Trial Checklist',
          description: 'Complete these tasks to activate your full membership.',
          remainingTime: remainingTime,
          expiresAt: trialExpiry,
          completedAt: null,
          isPaused: false,
          tasks: allTrialActivities.map((t) => ({
            id: t.id, // Include ID for manual completion
            key: t.key,
            title: t.title,
            description: t.description,
            url: t.actionUrl,
            expiresAt: t.expiresAt,
            isCompleted: completedActivityIds.has(t.id),
          })),
        });
      }
    } else {
      // Handle PAID / Non-Trial Users (Show all eligible activities as individual timers)
      // This includes GENERAL and BOTH types applicable to the tier

      for (const [type, activities] of activitiesByType.entries()) {
        // Skip TRIAL tasks for paid users unless we want to show them?
        // Usually Trial tasks are only for trial.
        // But if filtering Logic included them, maybe we show them?
        // User said "if a user is trial tier member... fetch only trial activity timer".
        // "if a user has a paid membership... each row... has a timer".

        // I will process all eligible activities.
        for (const t of activities) {
          // Skip if it's strictly a TRIAL type and user is not trial?
          // The filter above should handle it if 'includedTierIds' is set correctly by admin.
          // But as a safeguard/convention:
          if (type === ActivityTimerType.TRIAL) continue;

          const isCompleted = completedActivityIds.has(t.id);

          let expiresAt = t.expiresAt;
          // Dynamic expiry based on durationDays relative to... something.
          // Defaulting to "expires X days after creation" for fixed definitions?
          // Or maybe relative to membership start?
          // For now, sticking to logic: Fixed Date OR Duration from Creation.
          if (!expiresAt && t.durationDays) {
            expiresAt = new Date(
              t.createdAt.getTime() + t.durationDays * 24 * 60 * 60 * 1000,
            );
          }

          const remaining = expiresAt
            ? Math.max(0, expiresAt.getTime() - now.getTime())
            : null; // null if no expiry

          response.push({
            id: t.id,
            type: t.type,
            name: t.title,
            description: t.description,
            remainingTime: remaining,
            expiresAt: expiresAt,
            completedAt: completionMap.get(t.id) || null,
            isPaused: false,
            key: t.key, // Add key to top level for easy access
            tasks: [
              {
                // Keep nested structure for consistency if frontend expects it, or flatten?
                id: t.id,
                key: t.key,
                title: t.title,
                description: t.description,
                url: t.actionUrl,
                isCompleted: isCompleted,
              },
            ],
          });
        }
      }
    }

    return response;
  }

  /**
   * Complete activity by KEY
   */
  async completeTaskByKey(userId: string, key: string): Promise<void> {
    // Only allow manual completion for "OTHER" tasks as per requirement
    if (key !== 'OTHER') {
      throw new BadRequestException(
        'This task type is handled automatically by the system and cannot be marked manually.',
      );
    }

    const user = await this.activityRepository.manager.findOne(User, {
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Find ALL active activities with this key that are NOT yet completed by this user
    // Since we don't have a direct "pending" list, we query Definitions + UserActivities

    const activities = await this.activityRepository
      .createQueryBuilder('ActivityTimer')
      .select(['ActivityTimer.id', 'ActivityTimer.key'])
      .where('ActivityTimer.key = :key', { key })
      .andWhere('ActivityTimer.isActive = :isActive', { isActive: true })
      .getMany();

    if (!activities.length) return; // No such task definition

    for (const activity of activities) {
      // Check if already completed
      const existing = await this.userActivityRepository.findOne({
        where: { user: { id: userId }, activity: { id: activity.id } },
      });

      if (!existing) {
        const completion = this.userActivityRepository.create({
          user,
          activity,
        });
        await this.userActivityRepository.save(completion);
      }
    }
  }

  async isRestricted(user: User): Promise<boolean> {
    const fullUser = await this.activityRepository.manager.findOne(User, {
      where: { id: user.id },
      relations: ['membership'],
    });

    if (fullUser?.membership) {
      if (!fullUser.membership.isActive) return true;

      if (fullUser.membership.isTrial) {
        const now = new Date();
        if (new Date(fullUser.membership.expiresAt) < now) {
          return true; // Trial expired
        }
      }
      return false; // Active paid or active trial
    }

    return false;
  }
}
