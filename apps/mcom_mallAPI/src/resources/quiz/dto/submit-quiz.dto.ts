import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizAnswerDto } from './quiz-answer.dto';

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Array of answers submitted by the user',
    type: [QuizAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}
