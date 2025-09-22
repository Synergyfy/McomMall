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
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role:string;
  socials: Socials;
  profilePictureUrl?: string;
}

export interface UpdateUserDto {
  name?: string;
  phoneNumber?: string;
  socials?: Partial<Omit<Socials, 'id'>>;
  profilePictureUrl?: string;
}
