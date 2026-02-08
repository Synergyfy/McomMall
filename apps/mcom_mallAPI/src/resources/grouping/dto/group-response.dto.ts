import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../entities/group.entity';

export class GroupResponseDto extends Group {
  @ApiProperty({
    description: 'Indicates if the current user is the founder of the group.',
    type: Boolean,
  })
  isOwner: boolean;

  @ApiProperty({
    description: 'The current number of members in the group.',
    type: Number,
  })
  memberCount: number;
}