import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisibilitySettings } from './entities/visibility-settings.entity';
import { UpdateVisibilitySettingsDto } from './dto/update-visibility-settings.dto';

@Injectable()
export class VisibilityService {
  constructor(
    @InjectRepository(VisibilitySettings)
    private readonly settingsRepository: Repository<VisibilitySettings>,
  ) {}

  async getOrCreateSettings(businessId: string): Promise<VisibilitySettings> {
    let settings = await this.settingsRepository.findOne({ where: { businessId } });
    if (!settings) {
      settings = this.settingsRepository.create({
        businessId,
        radius: 10,
        hubs: ['Islington', 'Hackney'],
        featuredDaysLeft: 3,
        rotatorOrder: ['New Arrivals', 'Best Sellers', 'Seasonal Promo'],
        highStreetMode: false,
      });
      settings = await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(
    businessId: string,
    updateDto: UpdateVisibilitySettingsDto,
  ): Promise<VisibilitySettings> {
    const settings = await this.getOrCreateSettings(businessId);
    Object.assign(settings, updateDto);
    return this.settingsRepository.save(settings);
  }
}
