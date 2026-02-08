import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification.enum';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    sender: User,
  ): Promise<Message> {
    const { content, receiverId, parentMessageId } = createMessageDto;

    const receiver = await this.usersService.findOne(receiverId);

    let conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'user1')
      .innerJoin('conversation.participants', 'user2')
      .where('user1.id = :senderId', { senderId: sender.id })
      .andWhere('user2.id = :receiverId', { receiverId })
      .getOne();

    if (!conversation) {
      conversation = this.conversationRepository.create({
        participants: [sender, receiver],
      });
      await this.conversationRepository.save(conversation);
    }

    let parentMessage: Message | undefined = undefined;
    if (parentMessageId) {
      parentMessage = await this.messageRepository.findOne({
        where: { id: parentMessageId, conversation: { id: conversation.id } },
      });
      if (!parentMessage) {
        throw new NotFoundException(
          `Parent message with ID ${parentMessageId} not found in this conversation.`,
        );
      }
    }

    const message = this.messageRepository.create({
      content,
      sender,
      conversation,
      parentMessage,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.notificationService.create({
      recipientId: receiver.id,
      senderId: sender.id,
      type: NotificationType.NEW_MESSAGE,
      entityId: savedMessage.id,
    });

    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: [
        'conversation',
        'conversation.participants',
        'sender',
        'parentMessage',
      ],
    });
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('c.id')
          .from(Conversation, 'c')
          .innerJoin('c.participants', 'p')
          .where('p.id = :userId', { userId })
          .getQuery();
        return 'conversation.id IN ' + subQuery;
      })
      .getMany();

    return conversations;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender', 'replies', 'parentMessage'],
      order: { created_at: 'ASC' },
    });
  }

  async getConversationById(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      return null;
    }

    const lastMessage = await this.messageRepository.findOne({
      where: { conversation: { id: conversationId } },
      order: { created_at: 'DESC' },
      relations: ['sender'],
    });

    conversation.messages = lastMessage ? [lastMessage] : [];

    return conversation;
  }
}
