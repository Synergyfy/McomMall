import { ApiProperty } from '@nestjs/swagger';

export class CustomerStatsDto {
  @ApiProperty({
    description: 'Current spendable points balance',
    example: 1250,
  })
  pointsBalance: number;

  @ApiProperty({
    description: 'Total amount spent on product orders',
    example: 750.25,
  })
  totalAmountSpentOnProductOrdered: number;

  @ApiProperty({
    description: 'Total number of products ordered',
    example: 15,
  })
  totalNumberOfProductOrdered: number;

  @ApiProperty({
    description: 'Total number of services booked',
    example: 5,
  })
  totalNumberOfServiceBooked: number;

  @ApiProperty({
    description:
      'Total number of points earned',
    example: 5000,
  })
  totalNumberOfPointsEarned: number;

  @ApiProperty({
    description: 'Total number of points redeemed for offers',
    example: 2500,
  })
  totalNumberOfPointsRedeemed: number;

  @ApiProperty({
    description: 'Total amount spent on vouchers',
    example: 100.0,
  })
  totalAmountSpentOnVoucher: number;

  @ApiProperty({
    description: 'Total amount spent on gift cards',
    example: 200.0,
  })
  totalAmountSpentOnGiftCards: number;
}
