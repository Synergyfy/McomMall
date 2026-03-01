export interface Socials {
  id: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: string;
  socials: Socials;
  profilePictureUrl?: string;
  giftCard: boolean;
  voucher: boolean;
  promotion: boolean;
  coupons: boolean;
  shippingAddresses?: any[]; // Allow shippingAddresses
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  socials?: Partial<Omit<Socials, 'id'>>;
  profilePictureUrl?: string;
  giftCard?: boolean;
  voucher?: boolean;
  promotion?: boolean;
  coupons?: boolean;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  promotionPoints: number;
  promotionsParticipating: number;
}
