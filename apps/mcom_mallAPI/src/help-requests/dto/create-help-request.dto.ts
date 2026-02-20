import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HelpRequestType } from '../entities/help-request.entity';

export class CreateHelpRequestDto {
  @ApiProperty({
    enum: HelpRequestType,
    description: 'The specific type of help needed.',
    example: HelpRequestType.PRODUCT_CREATION
  })
  @IsEnum(HelpRequestType)
  @IsNotEmpty()
  type: HelpRequestType;

  @ApiProperty({
    description: 'A short title for your request.',
    example: 'Bulk upload help'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'A full description of the issue or task you need help with.',
    example: 'I have 500 products to upload using the CSV importer but I keep getting an error on column 5. Can you assist?'
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
