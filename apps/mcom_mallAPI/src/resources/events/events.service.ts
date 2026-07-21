import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { Business } from '../listings/entities/listing.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async create(userId: string, createEventDto: CreateEventDto): Promise<Event> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new NotFoundException(
        'No business found for the current merchant user',
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      businessId: business.id,
      status: createEventDto.status || 'upcoming',
    });

    return this.eventRepository.save(event);
  }

  async findAllForBusiness(userId: string): Promise<Event[]> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new NotFoundException(
        'No business found for the current merchant user',
      );
    }

    return this.eventRepository.find({
      where: { businessId: business.id },
      order: { created_at: 'DESC' },
      relations: ['voucherProduct'],
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['business', 'voucherProduct'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    const updated = this.eventRepository.merge(event, updateEventDto);
    return this.eventRepository.save(updated);
  }

  async updateStatus(id: string, status: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = status;
    return this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }
}
