import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HelpRequest } from './entities/help-request.entity';
import { CreateHelpRequestDto } from './dto/create-help-request.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HelpRequestsService {
  private readonly logger = new Logger(HelpRequestsService.name);
  private centralUrl: string;

  constructor(
    @InjectRepository(HelpRequest)
    private helpRequestRepo: Repository<HelpRequest>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.centralUrl = this.configService.get<string>('MCOM_CENTRAL_URL') || 'http://localhost:3010/api/v1';
  }

  async create(userId: string, dto: CreateHelpRequestDto): Promise<HelpRequest> {
    const helpRequest = this.helpRequestRepo.create({
      requesterId: userId,
      ...dto,
      status: 'SUBMITTED',
    });
    const savedRequest = await this.helpRequestRepo.save(helpRequest);

    try {
      const centralPayload = {
        title: `[Mall] ${dto.title}`,
        description: `Type: ${dto.type}\n\n${dto.description}`,
        taskType: dto.type,
        originSystem: 'MCOM_MALL',
        originRequesterId: userId,
      };

      await lastValueFrom(
        this.httpService.post(`${this.centralUrl}/tasks`, centralPayload, {
          headers: {
            'x-api-key': this.configService.get<string>('INTERNAL_API_KEY'),
          },
        })
      );
      
      this.logger.log(`Help request ${savedRequest.id} forwarded to Central.`);
    } catch (error) {
      this.logger.error(`Failed to forward help request to Central: ${error.message}`, error.stack);
    }

    return savedRequest;
  }

  async findAll(userId: string) {
    return this.helpRequestRepo.find({ where: { requesterId: userId }, order: { createdAt: 'DESC' } });
  }
}
