import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Encrypts MCOM Solutions SSO refresh tokens before they are stored on the
 * local User row. Keyed by TOKEN_ENCRYPTION_KEY (32-byte hex). When the key
 * is absent every helper returns null and callers must treat card top-up as
 * unavailable — wallet debits are unaffected.
 */
function getKey(): Buffer | null {
  const raw = (process.env.TOKEN_ENCRYPTION_KEY || '').trim();
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) return null;
  return Buffer.from(raw, 'hex');
}

export function isTokenEncryptionEnabled(): boolean {
  return getKey() !== null;
}

export function encryptToken(plaintext: string): string | null {
  const key = getKey();
  if (!key || !plaintext) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`;
}

export function decryptToken(payload: string): string | null {
  const key = getKey();
  if (!key || !payload) return null;
  try {
    const [ivHex, tagHex, dataHex] = payload.split(':');
    if (!ivHex || !tagHex || !dataHex) return null;
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return decipher.update(dataHex, 'hex', 'utf8') + decipher.final('utf8');
  } catch {
    return null;
  }
}
