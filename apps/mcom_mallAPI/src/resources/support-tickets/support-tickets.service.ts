import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, TicketStatus } from './entities/support-ticket.entity';
import { SupportMessage } from './entities/support-message.entity';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/role.enum';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private readonly messageRepo: Repository<SupportMessage>,
  ) {}

  async createTicket(user: User, dto: CreateSupportTicketDto): Promise<SupportTicket> {
    const ticket = this.ticketRepo.create({
      ...dto,
      userId: user.id,
      status: TicketStatus.OPEN,
      lastMessageAt: new Date(),
    });

    const savedTicket = await this.ticketRepo.save(ticket);

    // Initial message from user
    await this.addMessage(user, savedTicket.id, { content: dto.description });

    return savedTicket;
  }

  async addMessage(user: User, ticketId: string, dto: CreateSupportMessageDto): Promise<SupportMessage> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    if (!isAdmin && ticket.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to add a message to this ticket');
    }

    const message = this.messageRepo.create({
      content: dto.content,
      senderId: user.id,
      ticketId: ticket.id,
      isAdminMessage: isAdmin,
    });

    const savedMessage = await this.messageRepo.save(message);

    ticket.lastMessageAt = new Date();
    if (isAdmin && ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }
    await this.ticketRepo.save(ticket);

    return savedMessage;
  }

  async findAll(user: User) {
    if (user.role === UserRole.ADMIN) {
      return this.ticketRepo.find({
        order: { lastMessageAt: 'DESC' },
        relations: ['user'],
      });
    }
    return this.ticketRepo.find({
      where: { userId: user.id },
      order: { lastMessageAt: 'DESC' },
    });
  }

  async findOne(user: User, id: string) {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['user', 'messages', 'messages.sender'],
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (user.role !== UserRole.ADMIN && ticket.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this ticket');
    }

    // Sort messages by creation date
    ticket.messages.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    return ticket;
  }

  async resolveTicket(user: User, id: string) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (user.role !== UserRole.ADMIN && ticket.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to resolve this ticket');
    }

    ticket.status = TicketStatus.RESOLVED;
    return this.ticketRepo.save(ticket);
  }

  async closeTicket(user: User, id: string) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (user.role !== UserRole.ADMIN && ticket.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to close this ticket');
    }

    ticket.status = TicketStatus.CLOSED;
    return this.ticketRepo.save(ticket);
  }
}
