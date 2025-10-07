export interface OwnerStatsDto {
  totalAmountEarnedFromProductOrders: number;
  totalAmountEarnedFromGiftCard: number;
  totalAmountSpentForPromotions: number;
  totalOffersRedeemed: number;
  totalAmountSpentOnCoupon: number;
  totalAmountOfVoucherPurchased: number;
  totalAmountOfProduct: number;
  totalAmountOfService: number;
  totalAmountOfListing: number;
  totalWalletBalance: number;
}

export interface CustomerStatsDto {
  totalAmountSpentOnProductOrdered: number;
  totalNumberOfProductOrdered: number;
  totalNumberOfServiceBooked: number;
  totalNumberOfPromotionsParticipating: number;
  totalNumberOfPointsEarned: number;
  totalNumberOfPointsRedeemed: number;
  totalAmountSpentOnVoucher: number;
  totalAmountSpentOnGiftCards: number;
}