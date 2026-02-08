import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PromotionHistoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'The start date for the transaction history.',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'The end date for the transaction history.',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    enum: Order,
    default: Order.DESC,
    description: 'The order to sort the results by.',
  })
  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}
