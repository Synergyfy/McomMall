import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class QuizAnswerDto {
  @ApiProperty({
    description: 'UUID of the quiz question being answered',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'The selected answer option',
    example: 'Headline, Visual, Call to action',
  })
  @IsString()
  @IsNotEmpty()
  selectedOption: string;
}
