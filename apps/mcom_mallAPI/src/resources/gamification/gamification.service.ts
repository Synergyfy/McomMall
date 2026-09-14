import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from './entities/gamification.entity';
import { Business } from '../listings/entities/listing.entity';
import { CreateGamificationDto } from './dto/create-gamification.dto';
import { UpdateGamificationDto } from './dto/update-gamification.dto';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(Gamification)
    private readonly gamificationRepository: Repository<Gamification>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async create(
    userId: string,
    createDto: CreateGamificationDto,
  ): Promise<Gamification> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new NotFoundException(
        'No business found for the current merchant user',
      );
    }

    const gamification = this.gamificationRepository.create({
      ...createDto,
      businessId: business.id,
      status: createDto.status || 'active',
      totalParticipants: 0,
      gamesPlayed: 0,
      rewardsIssued: 0,
      rewardsClaimed: 0,
    });

    return this.gamificationRepository.save(gamification);
  }

  async findAllForBusiness(userId: string): Promise<Gamification[]> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new NotFoundException(
        'No business found for the current merchant user',
      );
    }

    return this.gamificationRepository.find({
      where: { businessId: business.id },
      order: { created_at: 'DESC' },
    });
  }

  async getSummary(userId: string): Promise<any> {
    const games = await this.findAllForBusiness(userId);
    const totalPoints = games
      .filter((game) => game.rewardType === 'points')
      .reduce((sum, game) => sum + Number(game.rewardValue ?? 0), 0);

    return {
      totalGames: games.length,
      activeGames: games.filter((game) => game.status === 'active').length,
      totalParticipants: games.reduce(
        (sum, game) => sum + game.totalParticipants,
        0,
      ),
      gamesPlayed: games.reduce((sum, game) => sum + game.gamesPlayed, 0),
      rewardsIssued: games.reduce((sum, game) => sum + game.rewardsIssued, 0),
      rewardsClaimed: games.reduce((sum, game) => sum + game.rewardsClaimed, 0),
      totalPoints,
      games,
    };
  }

  async findOne(id: string): Promise<Gamification> {
    const gamification = await this.gamificationRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!gamification) {
      throw new NotFoundException(
        `Gamification campaign with ID "${id}" not found`,
      );
    }

    return gamification;
  }

  async update(
    id: string,
    updateDto: UpdateGamificationDto,
  ): Promise<Gamification> {
    const gamification = await this.findOne(id);
    const updated = this.gamificationRepository.merge(gamification, updateDto);
    return this.gamificationRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const gamification = await this.findOne(id);
    await this.gamificationRepository.remove(gamification);
  }

  async simulatePlay(id: string): Promise<Gamification> {
    const gamification = await this.findOne(id);

    // Increment stats to simulate user engagement
    gamification.gamesPlayed += 1;

    // Add unique/new participants occasionally or on every play for simplicity
    gamification.totalParticipants += 1;

    // Simulate issuing a reward occasionally (80% chance)
    if (Math.random() < 0.8) {
      gamification.rewardsIssued += 1;

      // Simulate claiming the reward (70% of issued)
      if (Math.random() < 0.7) {
        gamification.rewardsClaimed += 1;
      }
    }

    return this.gamificationRepository.save(gamification);
  }
}
