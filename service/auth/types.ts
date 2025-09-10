export interface UserInterface {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirm_password: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  CUSTOMER = 'customer',
}

export interface AuthInterface {
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  auth: {
    refreshToken: string;
    accessToken: string;
  };
  userId: string;
  name: string;
  role: UserRole;
  packageInfo: { planType: string };
}

export interface ClaimInterface {
  place_id: string;
  returnUrl?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
