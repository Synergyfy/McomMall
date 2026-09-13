import { ApiProperty } from '@nestjs/swagger';

export class QuizAnswerResultDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  questionId: string;

  @ApiProperty({ example: 'Headline, Visual, Call to action' })
  selectedOption: string;

  @ApiProperty({ example: true })
  isCorrect: boolean;

  @ApiProperty({ example: 'Headline, Visual, Call to action' })
  correctOption: string;
}

export class QuizResultDto {
  @ApiProperty({ example: 3 })
  score: number;

  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    nullable: true,
  })
  attemptId?: string;

  @ApiProperty({ type: [QuizAnswerResultDto] })
  results: QuizAnswerResultDto[];
}
