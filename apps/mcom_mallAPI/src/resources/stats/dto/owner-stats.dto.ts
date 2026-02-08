import { ApiProperty } from '@nestjs/swagger';

export class OwnerStatsDto {
  @ApiProperty({
    description: 'Total amount earned from product orders',
    example: 1250.75,
  })
  totalAmountEarnedFromProductOrders: number;

  @ApiProperty({
    description: 'Total amount earned from gift card sales',
    example: 500.0,
  })
  totalAmountEarnedFromGiftCard: number;

  @ApiProperty({
    description: 'Total points distributed through promotions',
    example: 10000,
  })
  totalAmountSpentForPromotions: number;

  @ApiProperty({
    description: 'Total number of offers redeemed by customers',
    example: 50,
  })
  totalOffersRedeemed: number;

  @ApiProperty({
    description: 'Total discount amount given through coupons',
    example: 250.5,
  })
  totalAmountSpentOnCoupon: number;

  @ApiProperty({
    description: 'Total value of vouchers purchased by customers',
    example: 300.0,
  })
  totalAmountOfVoucherPurchased: number;

  @ApiProperty({
    description: 'Total number of products listed',
    example: 25,
  })
  totalAmountOfProduct: number;

  @ApiProperty({
    description: 'Total number of services listed',
    example: 10,
  })
  totalAmountOfService: number;

  @ApiProperty({
    description: 'Total number of business listings',
    example: 2,
  })
  totalAmountOfListing: number;

  @ApiProperty({
    description: 'Current balance in the user wallet',
    example: 5000.0,
  })
  totalWalletBalance: number;
}