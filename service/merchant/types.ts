export interface IBusiness {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  listingType: string[];
  businessName: string;
  legalName: string;
  companyRegistrationNumber: string;
  vatNumber: string;
  shortDescription: string;
  about: string;
  website: string;
  businessPhone: string;
  businessEmail: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  logoAltText: string | null;
  bannerAltText: string | null;
  media: string[] | null;
  status: string;
  googlePlaceId: string | null;
  isGoogleVerified: boolean;
  isClaimed: boolean;
}