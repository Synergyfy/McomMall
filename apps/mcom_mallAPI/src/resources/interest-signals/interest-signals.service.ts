import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterestSignal } from './entities/interest-signal.entity';
import { CreateInterestSignalDto } from './dto/create-interest-signal.dto';

@Injectable()
export class InterestSignalsService {
  constructor(
    @InjectRepository(InterestSignal)
    private readonly interestSignalRepository: Repository<InterestSignal>,
  ) {}

  async submitSignal(
    businessId: string,
    createDto: CreateInterestSignalDto,
  ): Promise<InterestSignal> {
    const signal = this.interestSignalRepository.create({
      businessId,
      ...createDto,
    });
    return this.interestSignalRepository.save(signal);
  }

  async getMetrics(businessId: string) {
    const signals = await this.interestSignalRepository.find({
      where: { businessId },
    });

    const totalVotes = signals.length;

    // Group signals by type to get categories
    const categoryCounts: Record<string, number> = {};
    signals.forEach((sig) => {
      const type = sig.signalType || 'General';
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    });

    const topCategories = Object.keys(categoryCounts)
      .map((key) => ({
        category: key,
        votes: categoryCounts[key],
      }))
      .sort((a, b) => b.votes - a.votes);

    // Calculate a simulated target metrics model
    const targetGoal = 100;
    const progressPercent = Math.min(
      100,
      Math.round((totalVotes / targetGoal) * 100),
    );

    return {
      totalViews: totalVotes * 4 + 124, // Simulated view multiplier
      totalVotes,
      progressPercent,
      targetGoal,
      sentimentScore: totalVotes > 0 ? 94 : 0, // High sentiment if active community
      topCategories,
      recentVoters: signals.slice(0, 5).map((sig) => ({
        id: sig.id,
        signalType: sig.signalType,
        createdAt: sig.createdAt,
      })),
    };
  }
}
