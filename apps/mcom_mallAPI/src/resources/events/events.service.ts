import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { LiveComment } from './entities/live-comment.entity';
import { Business } from '../listings/entities/listing.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateLiveCommentDto } from './dto/create-live-comment.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(LiveComment)
    private readonly liveCommentRepository: Repository<LiveComment>,
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

  async getPerformance(id: string): Promise<any> {
    const event = await this.findOne(id);
    const capacity = event.capacity || 0;
    const comments = await this.liveCommentRepository.count({
      where: { eventId: id },
    });

    // Derived performance metrics from capacity until a registrations
    // table is introduced (mirrors the existing automations summary pattern).
    const registrations = Math.floor(capacity * 0.95);
    const checkIns = Math.floor(registrations * 0.72);
    const rewardsClaimed = Math.round(checkIns * 0.45);
    const conversionRate =
      registrations > 0 ? Math.round((checkIns / registrations) * 100) : 0;
    const capacityFill =
      capacity > 0 ? Math.round((registrations / capacity) * 100) : 0;

    return {
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        capacity,
        borough: event.borough ?? null,
        highStreet: event.highStreet ?? null,
        status: event.status,
      },
      metrics: {
        registrations,
        checkIns,
        rewardsClaimed,
        conversionRate,
        capacityFill,
        commentsCount: comments,
      },
    };
  }

  async getLive(id: string): Promise<any> {
    const event = await this.findOne(id);
    if (event.status !== 'live') {
      throw new BadRequestException(
        `Event with ID "${id}" is not live (status: ${event.status})`,
      );
    }

    const comments = await this.liveCommentRepository.find({
      where: { eventId: id },
      order: { created_at: 'DESC' },
      take: 100,
    });

    const capacity = event.capacity || 0;
    const registrations = Math.floor(capacity * 0.95);
    const checkIns = Math.floor(registrations * 0.72);

    return {
      event: {
        id: event.id,
        title: event.title,
        status: event.status,
      },
      registrations,
      checkIns,
      rewardsClaimed: Math.round(checkIns * 0.45),
      comments: comments.map((comment) => ({
        id: comment.id,
        name: comment.authorName ?? 'Attendee',
        text: comment.text,
        likes: comment.likes,
        time: comment.created_at,
      })),
    };
  }

  async createComment(
    id: string,
    dto: CreateLiveCommentDto,
  ): Promise<LiveComment> {
    const event = await this.findOne(id);
    const comment = this.liveCommentRepository.create({
      eventId: event.id,
      text: dto.text,
      authorName: dto.authorName,
      likes: dto.likes ?? 0,
    });
    return this.liveCommentRepository.save(comment);
  }
}
