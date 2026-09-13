import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizResultDto, QuizAnswerResultDto } from './dto/quiz-result.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizAttempt)
    private readonly attemptRepository: Repository<QuizAttempt>,
  ) {}

  async findQuestions(): Promise<Omit<QuizQuestion, 'correctAnswerIndex'>[]> {
    const questions = await this.questionRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', created_at: 'ASC' },
    });

    return questions.map((question) => {
      const { correctAnswerIndex: _correctAnswerIndex, ...safeQuestion } =
        question;
      void _correctAnswerIndex;
      return safeQuestion;
    });
  }

  async submit(
    dto: SubmitQuizDto,
    authedUserId?: string,
  ): Promise<QuizResultDto> {
    if (dto.answers.length === 0) {
      throw new BadRequestException('At least one answer is required');
    }

    const questionIds = dto.answers.map((a) => a.questionId);
    const questions = await this.questionRepository.find({
      where: { id: In(questionIds), isActive: true },
    });

    if (questions.length !== dto.answers.length) {
      throw new BadRequestException(
        'One or more question IDs are invalid or inactive',
      );
    }

    const results: QuizAnswerResultDto[] = dto.answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      const isCorrect =
        question.options[question.correctAnswerIndex] === answer.selectedOption;
      return {
        questionId: question.id,
        selectedOption: answer.selectedOption,
        isCorrect,
        correctOption: question.options[question.correctAnswerIndex],
      };
    });

    const score = results.filter((r) => r.isCorrect).length;

    let attemptId: string | undefined;
    if (authedUserId) {
      const attempt = this.attemptRepository.create({
        userId: authedUserId,
        score,
        total: results.length,
        answers: results.map(({ questionId, selectedOption, isCorrect }) => ({
          questionId,
          selectedOption,
          isCorrect,
        })),
      });
      const saved = await this.attemptRepository.save(attempt);
      attemptId = saved.id;
    }

    return { score, total: results.length, attemptId, results };
  }

  async findAttemptsForUser(userId: string): Promise<QuizAttempt[]> {
    return this.attemptRepository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }
}
