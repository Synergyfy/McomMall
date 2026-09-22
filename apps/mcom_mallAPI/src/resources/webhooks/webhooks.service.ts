import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  async create(dto: CreateWebhookDto): Promise<Webhook> {
    const webhook = this.webhookRepository.create({
      ...dto,
      events: dto.events ?? [],
    });
    return this.webhookRepository.save(webhook);
  }

  async findAll(): Promise<Webhook[]> {
    return this.webhookRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<Webhook> {
    const webhook = await this.webhookRepository.findOne({ where: { id } });
    if (!webhook) {
      throw new NotFoundException(`Webhook with ID ${id} was not found`);
    }
    return webhook;
  }

  async update(id: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const webhook = await this.findOne(id);
    Object.assign(webhook, dto);
    return this.webhookRepository.save(webhook);
  }

  async remove(id: string): Promise<void> {
    const webhook = await this.findOne(id);
    await this.webhookRepository.remove(webhook);
  }
}
