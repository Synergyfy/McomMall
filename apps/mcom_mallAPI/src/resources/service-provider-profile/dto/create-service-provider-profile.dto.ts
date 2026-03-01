import { IsString, IsArray, IsOptional, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceProviderProfileDto {
  @ApiProperty({
    description: 'A list of skills the service provider possesses.',
    example: ['Plumbing', 'Electrical Wiring'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({
    description: 'The geographical area where the service provider operates.',
    example: 'New York City',
  })
  @IsString()
  serviceArea: string;

  @ApiProperty({
    description: "A list of URLs to the service provider's portfolio of work.",
    example: [
      'https://example.com/portfolio/project1',
      'https://example.com/portfolio/project2',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolio?: string[];
}
