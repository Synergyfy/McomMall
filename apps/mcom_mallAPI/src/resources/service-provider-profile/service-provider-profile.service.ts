import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProviderProfile } from './entities/service-provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateServiceProviderProfileDto } from './dto/create-service-provider-profile.dto';
import { UpdateServiceProviderProfileDto } from './dto/update-service-provider-profile.dto';
import { UserRole } from '../../common/role.enum';

@Injectable()
export class ServiceProviderProfileService {
  constructor(
    @InjectRepository(ServiceProviderProfile)
    private readonly profileRepository: Repository<ServiceProviderProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createDto: CreateServiceProviderProfileDto,
    user: User,
  ): Promise<ServiceProviderProfile> {
    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only owners can create a profile.');
    }

    const existingProfile = await this.profileRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (existingProfile) {
      throw new ConflictException('User profile already exists.');
    }

    const profile = this.profileRepository.create({
      ...createDto,
      user,
    });

    return this.profileRepository.save(profile);
  }

  async findMyProfile(user: User): Promise<ServiceProviderProfile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    return profile;
  }

  async findByUserId(userId: string): Promise<ServiceProviderProfile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    return profile;
  }

  async update(
    updateDto: UpdateServiceProviderProfileDto,
    user: User,
  ): Promise<ServiceProviderProfile> {
    const profile = await this.findMyProfile(user);
    const updatedProfile = this.profileRepository.merge(profile, updateDto);
    return this.profileRepository.save(updatedProfile);
  }
}
