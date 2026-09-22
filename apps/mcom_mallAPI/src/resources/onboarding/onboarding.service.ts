import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OnboardingQuestion } from './entities/onboarding-question.entity';
import {
  CreateOnboardingQuestionDto,
  ReorderOnboardingQuestionsDto,
  UpdateOnboardingQuestionDto,
} from './dto/onboarding-question.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingQuestion)
    private readonly questionRepository: Repository<OnboardingQuestion>,
  ) {}

  async create(dto: CreateOnboardingQuestionDto): Promise<OnboardingQuestion> {
    const count = await this.questionRepository.count();
    const question = this.questionRepository.create({
      ...dto,
      displayOrder: dto.displayOrder ?? count,
    });
    return this.questionRepository.save(question);
  }

  async findAll(): Promise<OnboardingQuestion[]> {
    return this.questionRepository.find({
      order: { displayOrder: 'ASC', created_at: 'ASC' },
    });
  }

  async findOne(id: string): Promise<OnboardingQuestion> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Onboarding question with ID ${id} was not found`);
    }
    return question;
  }

  async update(id: string, dto: UpdateOnboardingQuestionDto): Promise<OnboardingQuestion> {
    const question = await this.findOne(id);
    Object.assign(question, dto);
    return this.questionRepository.save(question);
  }

  async reorder(dto: ReorderOnboardingQuestionsDto): Promise<OnboardingQuestion[]> {
    const questions = await this.questionRepository.find({
      where: { id: In(dto.ids) },
    });
    const byId = new Map(questions.map((q) => [q.id, q]));
    const updated: OnboardingQuestion[] = [];
    dto.ids.forEach((id, index) => {
      const question = byId.get(id);
      if (question) {
        question.displayOrder = index;
        updated.push(question);
      }
    });
    return this.questionRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const question = await this.findOne(id);
    await this.questionRepository.remove(question);
  }
}
