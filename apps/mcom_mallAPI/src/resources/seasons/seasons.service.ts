import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { Season } from './entities/season.entity';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  create(createSeasonDto: CreateSeasonDto) {
    const startDate = new Date(createSeasonDto.startDate);
    const endDate = new Date(createSeasonDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const season = this.seasonRepository.create({
      ...createSeasonDto,
      startDate,
      endDate,
    });
    return this.seasonRepository.save(season);
  }

  findAll() {
    return this.seasonRepository.find();
  }

  async findOne(id: string) {
    const season = await this.seasonRepository.findOne({ where: { id } });
    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }
    return season;
  }

  async update(id: string, updateSeasonDto: UpdateSeasonDto) {
    const season = await this.findOne(id);

    const startDate = updateSeasonDto.startDate ? new Date(updateSeasonDto.startDate) : season.startDate;
    const endDate = updateSeasonDto.endDate ? new Date(updateSeasonDto.endDate) : season.endDate;

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    Object.assign(season, {
      ...updateSeasonDto,
      startDate,
      endDate,
    });
    return this.seasonRepository.save(season);
  }

  async remove(id: string) {
    const season = await this.findOne(id);
    return this.seasonRepository.remove(season);
  }
}
