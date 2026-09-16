import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import dataSource from '../data-source';
import { User } from '../../resources/users/entities/user.entity';
import { UserRole } from '../../common/role.enum';

const SALT_ROUNDS = 10;
const DEFAULT_ADMIN_EMAIL = 'admin@mcommall.local';
const DEFAULT_ADMIN_PHONE = '+440000000000';

function generatePassword(length = 16): string {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

async function seed(): Promise<void> {
  await dataSource.initialize();
  const userRepository = dataSource.getRepository(User);

  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  // Never hardcode secrets: prefer env, otherwise generate and print once.
  const plainPassword = process.env.ADMIN_PASSWORD || generatePassword();
  const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const existing = await userRepository.findOne({ where: { email } });

  if (existing) {
    existing.role = UserRole.ADMIN;
    existing.isActive = true;
    existing.isSuperUser = true;
    existing.isEmailVerified = true;
    existing.password = passwordHash;
    await userRepository.save(existing);
    console.log(`Admin user already existed — password reset for ${email}`);
  } else {
    let phoneNumber = process.env.ADMIN_PHONE || DEFAULT_ADMIN_PHONE;
    const phoneTaken = await userRepository.findOne({
      where: { phoneNumber },
    });
    if (phoneTaken) {
      phoneNumber = `+44${Date.now().toString().slice(-10)}`;
    }
    const admin = userRepository.create({
      firstName: 'Site',
      lastName: 'Admin',
      email,
      phoneNumber,
      password: passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      isSuperUser: true,
      isEmailVerified: true,
    });
    await userRepository.save(admin);
    console.log(`Admin user created for ${email}`);
  }

  console.log('\nLogin credentials (local dev only):');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${plainPassword}`);

  await dataSource.destroy();
  console.log('\nDatabase connection closed.');
}

seed().catch((err) => {
  console.error('Admin seed failed:', err);
  process.exit(1);
});
