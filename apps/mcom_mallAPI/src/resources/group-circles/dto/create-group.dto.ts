import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';
import { GroupType } from '../group-type.enum';

export class CreateGroupDto {
  @ApiProperty({
    description: 'The name of the group circle.',
    example: 'Summer Marketing Group',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The type of the group circle.',
    enum: GroupType,
    example: GroupType.MARKETING,
  })
  @IsEnum(GroupType)
  type: GroupType;

  @ApiProperty({
    description: 'The duration/season of the group circle.',
    example: 'Summer',
  })
  @IsString()
  @IsOptional()
  duration: string;

  @ApiProperty({
    description: 'The contribution amount per round.',
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  contributionAmount: number;

  @ApiProperty({
    description: 'Initial network contacts to invite.',
    type: [String],
    example: ['uuid1', 'uuid2'],
    required: false,
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  networkIds: string[];

  @ApiProperty({
    description: 'Initial referred businesses to invite.',
    type: [String],
    example: ['uuid3', 'uuid4'],
    required: false,
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  referredBusinessIds: string[];
}
