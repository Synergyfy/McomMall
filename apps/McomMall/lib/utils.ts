import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEnumValue(value: string) {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const CURRENCY = '£';

export function formatCurrency(amount: number | string) {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${CURRENCY}${numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const isImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  try {
    // Remove query parameters for the check
    const cleanUrl = url.split('?')[0];
    return /\.(jpeg|jpg|gif|png|webp|svg|avif|bmp|tiff)$/i.test(cleanUrl);
  } catch {
    return false;
  }
};

/**
 * Robustly discovers the main image for a product by checking all possible fields.
 * Fields checked in order: imageUrl, fileUrls, media, images.
 */
export const getProductMainImage = (product: any): string | null => {
  if (!product) return null;

  // 1. Check direct imageUrl field
  if (product.imageUrl && isImageUrl(product.imageUrl)) {
    return product.imageUrl;
  }

  // 2. Check fileUrls array
  if (Array.isArray(product.fileUrls) && product.fileUrls.length > 0) {
    const firstValid = product.fileUrls.find(isImageUrl);
    if (firstValid) return firstValid;
  }

  // 3. Check media array (common in some parts of the app)
  if (Array.isArray(product.media) && product.media.length > 0) {
    const firstValid = product.media.find(isImageUrl);
    if (firstValid) return firstValid;
  }

  // 4. Check images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstValid = product.images.find(isImageUrl);
    if (firstValid) return firstValid;
  }

  // Final fallback to raw fields even if they don't strictly match the regex but are strings
  // (Sometimes S3 URLs might lack extensions but be valid images)
  const candidate = product.imageUrl ||
    (Array.isArray(product.fileUrls) && product.fileUrls[0]) ||
    (Array.isArray(product.media) && product.media[0]) ||
    (Array.isArray(product.images) && product.images[0]);

  return typeof candidate === 'string' && candidate.startsWith('http') ? candidate : null;
};
