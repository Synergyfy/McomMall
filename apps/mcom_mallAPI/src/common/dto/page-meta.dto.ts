import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from './pagination-query.dto';

export class PageMetaDto {
  @ApiProperty()
  readonly totalItems: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly itemsPerPage: number;

  @ApiProperty()
  readonly totalPages: number;

  @ApiProperty()
  readonly currentPage: number;

  @ApiProperty()
  readonly hasNextPage: boolean;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  constructor({
    itemCount,
    pageOptionsDto,
    totalItems,
  }: {
    itemCount: number;
    pageOptionsDto: PaginationQueryDto;
    totalItems: number;
  }) {
    this.totalItems = totalItems;
    this.itemCount = itemCount;
    this.itemsPerPage = pageOptionsDto.limit;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = pageOptionsDto.page;
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;
  }
}
