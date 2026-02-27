import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../services/entities/service.entity';

export class GetProductPartnershipsDto {
  @ApiProperty({
    description: 'A list of services partnered with the product.',
    type: [Service],
  })
  services: Service[];
}
