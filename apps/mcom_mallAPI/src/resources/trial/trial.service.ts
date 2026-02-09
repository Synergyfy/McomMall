import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trial, TrialTask, TrialPause } from '../payments/entities/trial.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TrialService {
  constructor(
    @InjectRepository(Trial)
    private readonly trialRepository: Repository<Trial>,
  ) {}

  async createTrial(
    user: User,
    entityManager?: EntityManager,
    durationDays: number = 14
  ): Promise<Trial> {
    const trial = new Trial();
    trial.user = user;
    trial.startedAt = new Date();
    trial.expiresAt = new Date(
      trial.startedAt.getTime() + durationDays * 24 * 60 * 60 * 1000,
    );

    if (entityManager) {
      return entityManager.save(trial);
    } else {
      return this.trialRepository.save(trial);
    }
  }

  async getTrialStatus(userId: string): Promise<any> {
    const trial = await this.findTrialByUserId(userId);

    const now = new Date();
    let remainingTime = trial.expiresAt.getTime() - now.getTime();
    if (remainingTime < 0) {
      remainingTime = 0;
    }

    return {
      isActive: trial.isActive,
      remainingTime,
      tasks: trial.tasks,
      pauses: trial.pauses,
    };
  }

  async pauseTrial(userId: string): Promise<Trial> {
    const trial = await this.findTrialByUserId(userId);

    if (trial.pauses.length >= 2) {
      throw new BadRequestException('You have already used all your pauses.');
    }

    const activePause = trial.pauses.find((p) => p.resumedAt === null);
    if (activePause) {
      throw new BadRequestException('Your trial is already paused.');
    }

    trial.pauses.push({ pausedAt: new Date(), resumedAt: null });
    return this.trialRepository.save(trial);
  }

  async resumeTrial(userId: string): Promise<Trial> {
    const trial = await this.findTrialByUserId(userId);
    const activePause = trial.pauses.find((p) => p.resumedAt === null);

    if (!activePause) {
      throw new BadRequestException('Your trial is not paused.');
    }

    activePause.resumedAt = new Date();
    const pauseDuration = activePause.resumedAt.getTime() - new Date(activePause.pausedAt).getTime();
    trial.expiresAt = new Date(trial.expiresAt.getTime() + pauseDuration);

    return this.trialRepository.save(trial);
  }

  async checkAndResumeTrial(userId: string): Promise<void> {
    const trial = await this.findTrialByUserId(userId);
    const activePause = trial.pauses.find((p) => p.resumedAt === null);

    if (activePause) {
      const now = new Date();
      const pauseDuration = now.getTime() - new Date(activePause.pausedAt).getTime();
      const maxPauseDuration = 48 * 60 * 60 * 1000; // 48 hours

      if (pauseDuration > maxPauseDuration) {
        activePause.resumedAt = new Date(new Date(activePause.pausedAt).getTime() + maxPauseDuration);
        trial.expiresAt = new Date(trial.expiresAt.getTime() + maxPauseDuration);
        await this.trialRepository.save(trial);
      }
    }
  }

  async markTaskAsCompleted(
    userId: string,
    task: keyof TrialTask,
  ): Promise<Trial | null> {
    const trial = await this.trialRepository.findOne({ where: { user: { id: userId } } });

    if (!trial) {
        return null;
    }

    if (trial.isActive && !trial.tasks[task]) {
      trial.tasks[task] = true;
      return this.trialRepository.save(trial);
    }

    return trial;
  }

  private async findTrialByUserId(userId: string): Promise<Trial> {
    const trial = await this.trialRepository.findOne({ where: { user: { id: userId } } });
    if (!trial) {
      throw new NotFoundException('Trial not found for this user.');
    }
    return trial;
  }
}
