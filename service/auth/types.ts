export interface UserInterface {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  provisionCode?: string;
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

export interface SendOtpInterface {
  email: string;
  type: 'VERIFICATION' | 'PASSWORD_RESET';
}

export interface ValidateOtpInterface {
  email: string;
  otp: string;
  type: 'VERIFICATION' | 'PASSWORD_RESET';
}

export interface ResetPasswordInterface {
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
}
