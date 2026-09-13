import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizService } from './quiz.service';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { BadRequestException } from '@nestjs/common';

describe('QuizService', () => {
  let service: QuizService;
  let questionRepo: Repository<QuizQuestion>;
  let attemptRepo: Repository<QuizAttempt>;

  const mockQuestion: QuizQuestion = {
    id: 'q1',
    question: 'Which is the best subjectline for a sale email',
    options: [
      'Big sale',
      'Get 25% off your next order today',
      'Read this please',
    ],
    correctAnswerIndex: 1,
    order: 0,
    isActive: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as QuizQuestion;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getRepositoryToken(QuizQuestion),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(QuizAttempt),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<QuizService>(QuizService);
    questionRepo = moduleRef.get<Repository<QuizQuestion>>(
      getRepositoryToken(QuizQuestion),
    );
    attemptRepo = moduleRef.get<Repository<QuizAttempt>>(
      getRepositoryToken(QuizAttempt),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findQuestions', () => {
    it('strips correctAnswerIndex from the payload', async () => {
      jest.spyOn(questionRepo, 'find').mockResolvedValue([mockQuestion]);
      const result = await service.findQuestions();
      expect(result[0]).not.toHaveProperty('correctAnswerIndex');
      expect(result[0].question).toBe(mockQuestion.question);
    });
  });

  describe('submit', () => {
    it('rejects empty answers', async () => {
      await expect(service.submit({ answers: [] })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('scores correct and incorrect answers', async () => {
      jest.spyOn(questionRepo, 'find').mockResolvedValue([mockQuestion]);
      const result = await service.submit({
        answers: [
          {
            questionId: 'q1',
            selectedOption: 'Get 25% off your next order today',
          },
        ],
      });
      expect(result.score).toBe(1);
      expect(result.total).toBe(1);
      expect(result.results[0].isCorrect).toBe(true);
    });

    it('persists an attempt when a user id is present', async () => {
      jest.spyOn(questionRepo, 'find').mockResolvedValue([mockQuestion]);
      const attempt = { id: 'a1' } as QuizAttempt;
      jest.spyOn(attemptRepo, 'create').mockReturnValue(attempt as any);
      jest.spyOn(attemptRepo, 'save').mockResolvedValue(attempt as any);

      const result = await service.submit(
        { answers: [{ questionId: 'q1', selectedOption: 'Big sale' }] },
        'user-1',
      );
      expect(result.attemptId).toBe('a1');
      expect(attemptRepo.save).toHaveBeenCalled();
    });

    it('does not persist an attempt for anonymous submissions', async () => {
      jest.spyOn(questionRepo, 'find').mockResolvedValue([mockQuestion]);
      const result = await service.submit({
        answers: [{ questionId: 'q1', selectedOption: 'Big sale' }],
      });
      expect(result.attemptId).toBeUndefined();
      expect(attemptRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAttemptsForUser', () => {
    it('returns attempts for a user', async () => {
      jest
        .spyOn(attemptRepo, 'find')
        .mockResolvedValue([{ id: 'a1' } as QuizAttempt]);
      const result = await service.findAttemptsForUser('user-1');
      expect(result).toHaveLength(1);
      expect(attemptRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { created_at: 'DESC' },
      });
    });
  });
});
