import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiExtraModels } from '@nestjs/swagger';
import { SocialDto } from './social.dto';
import { ValidateNested, IsUrl, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

@ApiExtraModels()
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['role']),
) {
  @ValidateNested()
  @Type(() => SocialDto)
  socials?: SocialDto;

  @IsUrl()
  @IsOptional()
  profilePictureUrl?: string;
}
