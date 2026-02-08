export interface IBusiness {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  listingType: string[];
  businessName: string;
  legalName?: string | null;
  companyRegistrationNumber?: string | null;
  vatNumber?: string | null;
  shortDescription?: string | null;
  about?: string | null;
  website?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  logoAltText?: string | null;
  bannerAltText?: string | null;
  media?: string[] | null;
  status: string;
  googlePlaceId?: string | null;
  isGoogleVerified: boolean;
  isClaimed: boolean;
}