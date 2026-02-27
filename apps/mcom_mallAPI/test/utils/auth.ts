import { INestApplication } from '@nestjs/common';
import { UsersService } from '../../src/resources/users/users.service';
import { AuthService } from '../../src/resources/auth/auth.service';
import { UserRole } from '../../src/common/role.enum';
import { User } from '../../src/resources/users/entities/user.entity';

export async function createAuthenticatedUser(
  app: INestApplication,
  role: UserRole = UserRole.CUSTOMER,
): Promise<{ user: User; accessToken: string }> {
  const usersService = app.get(UsersService);
  const authService = app.get(AuthService);

  const email = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const password = 'Password123!';

  // Create User
  const user = await usersService.create({
    email,
    password,
    confirm_password: password,
    firstName: 'Test',
    lastName: 'User',
    role,
    phoneNumber: `+1${Math.floor(Math.random() * 10000000000)}`, // Random phone number
  });

  // Login to get token
  // Since we are mocking everything or running in test env, we can directly create login
  // Note: authService.createLogin usually returns { accessToken, refreshToken, ... }
  const authResponse = await authService.createLogin({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    userId: user.id,
  });

  return {
    user,
    accessToken: authResponse.accessToken,
  };
}
