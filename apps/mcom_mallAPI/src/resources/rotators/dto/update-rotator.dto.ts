import { PartialType } from '@nestjs/mapped-types';
import { CreateRotatorDto } from './create-rotator.dto';

export class UpdateRotatorDto extends PartialType(CreateRotatorDto) {}
