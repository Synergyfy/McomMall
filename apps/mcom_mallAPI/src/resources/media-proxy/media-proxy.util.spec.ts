import { sanitiseMediaPath } from './media-proxy.util';

describe('sanitiseMediaPath', () => {
  it('accepts generated filenames and one nested folder', () => {
    expect(sanitiseMediaPath('b60ee38a-d6ed-419a-ab4a-3a28c8ec4209.png')).toBe(
      'b60ee38a-d6ed-419a-ab4a-3a28c8ec4209.png',
    );
    expect(sanitiseMediaPath('catalog/abc.def.webp')).toBe(
      'catalog/abc.def.webp',
    );
    expect(sanitiseMediaPath('%2Fcatalog%2Fabc.webp')).toBe(
      'catalog/abc.webp',
    );
  });

  it('rejects traversal and encoded escapes', () => {
    expect(sanitiseMediaPath('../etc/passwd')).toBeNull();
    expect(sanitiseMediaPath('catalog/../../secret.png')).toBeNull();
    expect(sanitiseMediaPath('..%2Fetc%2Fpasswd')).toBeNull();
    expect(sanitiseMediaPath('%2e%2e/secret')).toBeNull();
    expect(sanitiseMediaPath('')).toBeNull();
  });

  it('rejects unexpected characters', () => {
    expect(sanitiseMediaPath('file with spaces.png')).toBeNull();
    expect(sanitiseMediaPath('shell;rm.png')).toBeNull();
    expect(sanitiseMediaPath('.hidden.png')).toBeNull();
  });

  it('caps nesting depth', () => {
    expect(sanitiseMediaPath('a/b/c/d/e/f/g.png')).toBeNull();
  });
});
