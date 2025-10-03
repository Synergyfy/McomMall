import { UserRole } from "@/service/auth/types";

export type SocialPlatform =
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'instagram'
  | 'youtube';

export interface Socials {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
}

export interface IUser {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    role: UserRole;
    socials?: Socials;
  }