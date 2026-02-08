import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels()
export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
