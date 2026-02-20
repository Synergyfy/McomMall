import { ApiProperty } from '@nestjs/swagger';

export class CustomerStatsDto {
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
    description: 'Total number of promotions the user is participating in',
    example: 3,
  })
  totalNumberOfPromotionsParticipating: number;

  @ApiProperty({
    description:
      'Total number of points earned from participating in promotions',
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
