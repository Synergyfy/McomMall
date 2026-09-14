import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizResultDto } from './dto/quiz-result.dto';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Public()
  @Get('questions')
  @ApiOperation({
    summary: 'List all active quiz questions',
    description:
      'Returns the active quiz questions in order. Correct answers are stripped from the payload. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz questions retrieved successfully',
    type: [QuizQuestion],
  })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error' })
  findQuestions() {
    return this.quizService.findQuestions();
  }

  @Public()
  @Post('submit')
  @ApiOperation({
    summary: 'Submit quiz answers and receive a score',
    description:
      'Validates each answer against the active questions and returns the score, per-question results, and the correct options. If an authenticated token is supplied, the attempt is persisted.',
  })
  @ApiResponse({
    status: 201,
    description: 'Quiz submitted and scored successfully',
    type: QuizResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payload or one or more question IDs invalid',
  })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error' })
  submit(@Body() dto: SubmitQuizDto, @CurrentUser() user?: User) {
    return this.quizService.submit(dto, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('attempts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user past quiz attempts' })
  @ApiResponse({
    status: 200,
    description: 'Quiz attempts retrieved successfully',
    type: [QuizAttempt],
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  findAttempts(@CurrentUser() user: User) {
    return this.quizService.findAttemptsForUser(user.id);
  }
}
