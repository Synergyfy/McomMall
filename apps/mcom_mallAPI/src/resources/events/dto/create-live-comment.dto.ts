import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateLiveCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  likes?: number;
}
