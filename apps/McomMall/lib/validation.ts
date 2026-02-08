export const isNotEmpty = (value: string | undefined | null): boolean => {
  return value !== null && value !== undefined && value.trim() !== '';
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  // Basic regex for phone numbers: allows digits, spaces, dashes, parentheses, and an optional leading '+'
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
  return phoneRegex.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  // Standard email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.split('@')[1].includes('.');
};

export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    let effectiveUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      effectiveUrl = `https://${url}`;
    }
    new URL(effectiveUrl);
    return true;
  } catch (_) {
    return false;
  }
};

export const isLength = (
  value: string,
  options: { min?: number; max?: number }
): boolean => {
  if (!value) return false;
  if (options.min && value.length < options.min) {
    return false;
  }
  if (options.max && value.length > options.max) {
    return false;
  }
  return true;
};
