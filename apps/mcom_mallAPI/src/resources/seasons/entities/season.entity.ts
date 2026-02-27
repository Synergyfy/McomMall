import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity('seasons')
export class Season extends AbstractBaseEntity {
  @ApiProperty({
    example: 'Summer 2026',
    description: 'The name of the season',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Summer discount season',
    description: 'Description of the season',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Image URL for the season',
    nullable: true,
  })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({
    example: '2026-06-01T00:00:00Z',
    description: 'Start date of the season',
  })
  @Column()
  startDate: Date;

  @ApiProperty({
    example: '2026-08-31T23:59:59Z',
    description: 'End date of the season',
  })
  @Column()
  endDate: Date;
}
