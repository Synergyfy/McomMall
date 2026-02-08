import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  receiverId: string;

  @IsUUID()
  @IsOptional()
  parentMessageId?: string;
}
