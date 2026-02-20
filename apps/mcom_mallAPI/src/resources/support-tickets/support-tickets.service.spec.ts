import { Test, TestingModule } from '@nestjs/testing';
import { SupportTicketsService } from './support-tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SupportTicket, TicketStatus } from './entities/support-ticket.entity';
import { SupportMessage } from './entities/support-message.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/role.enum';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('SupportTicketsService', () => {
  let service: SupportTicketsService;
  let ticketRepo: Repository<SupportTicket>;
  let messageRepo: Repository<SupportMessage>;

  const mockUser = { id: 'user-1', role: UserRole.CUSTOMER } as User;
  const mockAdmin = { id: 'admin-1', role: UserRole.ADMIN } as User;

  const mockTicket = {
    id: 'ticket-1',
    subject: 'Test Ticket',
    description: 'Test Description',
    userId: 'user-1',
    status: TicketStatus.OPEN,
    lastMessageAt: new Date(),
  } as SupportTicket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportTicketsService,
        {
          provide: getRepositoryToken(SupportTicket),
          useValue: {
            create: jest.fn().mockReturnValue(mockTicket),
            save: jest.fn().mockResolvedValue(mockTicket),
            findOne: jest.fn().mockResolvedValue(mockTicket),
            find: jest.fn().mockResolvedValue([mockTicket]),
          },
        },
        {
          provide: getRepositoryToken(SupportMessage),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<SupportTicketsService>(SupportTicketsService);
    ticketRepo = module.get<Repository<SupportTicket>>(getRepositoryToken(SupportTicket));
    messageRepo = module.get<Repository<SupportMessage>>(getRepositoryToken(SupportMessage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTicket', () => {
    it('should create a ticket and an initial message', async () => {
      const dto = { subject: 'Test', description: 'Desc' };
      const result = await service.createTicket(mockUser, dto);

      expect(ticketRepo.create).toHaveBeenCalled();
      expect(ticketRepo.save).toHaveBeenCalled();
      expect(messageRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        content: dto.description,
        senderId: mockUser.id,
      }));
      expect(result).toEqual(mockTicket);
    });
  });

  describe('addMessage', () => {
    it('should add a message to a ticket', async () => {
      const dto = { content: 'Reply' };
      await service.addMessage(mockUser, 'ticket-1', dto);

      expect(messageRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        content: dto.content,
        senderId: mockUser.id,
        isAdminMessage: false,
      }));
      expect(ticketRepo.save).toHaveBeenCalled();
    });

    it('should allow admin to add a message and update status', async () => {
      const dto = { content: 'Admin Reply' };
      (ticketRepo.findOne as jest.Mock).mockResolvedValue({ ...mockTicket, status: TicketStatus.OPEN });

      await service.addMessage(mockAdmin, 'ticket-1', dto);

      expect(messageRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        content: dto.content,
        senderId: mockAdmin.id,
        isAdminMessage: true,
      }));
      expect(ticketRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        status: TicketStatus.IN_PROGRESS,
      }));
    });

    it('should throw ForbiddenException if non-owner user tries to add message', async () => {
      const otherUser = { id: 'user-2', role: UserRole.CUSTOMER } as User;
      await expect(service.addMessage(otherUser, 'ticket-1', { content: 'Hi' }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return user tickets for customer', async () => {
      await service.findAll(mockUser);
      expect(ticketRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: mockUser.id }
      }));
    });

    it('should return all tickets for admin', async () => {
      await service.findAll(mockAdmin);
      expect(ticketRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        relations: ['user']
      }));
    });
  });

  describe('resolveTicket', () => {
    it('should update status to RESOLVED', async () => {
      await service.resolveTicket(mockUser, 'ticket-1');
      expect(ticketRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        status: TicketStatus.RESOLVED
      }));
    });
  });
});
