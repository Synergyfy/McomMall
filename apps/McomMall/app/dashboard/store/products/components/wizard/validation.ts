/**
 * Lightweight validation for the Add Product wizard.
 *
 * The product wizard keeps its state in a plain `formData` object (no
 * react-hook-form), so instead of a resolver we expose pure functions that
 * return a `{ field: message }` map. The page stores that map in `errors`
 * state and passes it down to each step for inline display.
 */

export type ProductFormErrors = Record<string, string>;

const isBlank = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

const toNumber = (value: unknown): number | undefined => {
  if (isBlank(value)) return undefined;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const hasText = (value: unknown): boolean =>
  typeof value === 'string' && value.trim().length > 0;

const plainText = (value: unknown): string =>
  typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : '';

/**
 * A field key changes → the error keys that should be cleared.
 * Allows `updateFormData` to clear the right error even when the error key
 * differs from the changed data key (e.g. shortDesc/fullDesc → description).
 */
export const PRODUCT_ERROR_ALIASES: Record<string, string[]> = {
  businessId: ['businessId'],
  productName: ['productName'],
  category: ['category'],
  categoryName: ['category'],
  shortDesc: ['description'],
  fullDesc: ['description'],
  product_type: ['regular_price', 'fileUrls'],
  regular_price: ['regular_price'],
  sale_price: ['regular_price'],
  hasVariants: ['attributes', 'variations'],
  useVariantPricing: ['attributes', 'variations'],
  attributes: ['attributes', 'variations'],
  variations: ['variations', 'attributes'],
  fileUrls: ['fileUrls'],
  isFreeDelivery: ['delivery', 'freeDelivery', 'freeDeliveryRadius'],
  isPaidDelivery: ['delivery'],
  deliveryOriginAddressId: ['freeDelivery', 'freeDeliveryRadius'],
  deliveryOriginAddressLine1: ['freeDelivery'],
  deliveryOriginCity: ['freeDelivery'],
  deliveryOriginPostalCode: ['freeDelivery'],
  freeDeliveryRadius: ['freeDelivery', 'freeDeliveryRadius'],
};

/**
 * Validates a single wizard step. Steps that require no input (selection /
 * informational steps) simply return an empty map.
 */
export function validateProductStep(step: number, formData: any): ProductFormErrors {
  const errors: ProductFormErrors = {};

  switch (step) {
    case 1: {
      if (isBlank(formData?.businessId)) {
        errors.businessId = 'Please select a business';
      }
      if (isBlank(formData?.productName)) {
        errors.productName = 'Product name is required';
      } else if (String(formData.productName).trim().length < 3) {
        errors.productName = 'Product name must be at least 3 characters';
      }
      if (isBlank(formData?.category)) {
        errors.category = 'Please select a category';
      }
      break;
    }

    case 2: {
      const hasFullDesc = plainText(formData?.fullDesc).length > 0;
      const hasShortDesc = hasText(formData?.shortDesc);
      if (!hasFullDesc && !hasShortDesc) {
        errors.description = 'Add a short or full description so customers know what you sell';
      }
      if (
        formData?.product_type === 'downloadable' &&
        (!Array.isArray(formData?.fileUrls) || formData.fileUrls.length === 0)
      ) {
        errors.fileUrls = 'Upload at least one digital file for customers to download';
      }
      break;
    }

    case 3: {
      const hasVariants = Boolean(formData?.hasVariants);
      const useVariantPricing = formData?.useVariantPricing ?? true;

      if (hasVariants && useVariantPricing) {
        const attributes: any[] = Array.isArray(formData?.attributes) ? formData.attributes : [];
        const variations: any[] = Array.isArray(formData?.variations) ? formData.variations : [];

        const usableAttributes = attributes.filter(
          (attr) => hasText(attr?.name) && Array.isArray(attr.options) && attr.options.some((opt: any) => hasText(opt?.name)),
        );

        if (usableAttributes.length === 0) {
          errors.attributes = 'Add at least one option (for example Size or Colour) with values';
        }
        if (variations.length === 0) {
          errors.variations = 'Generate your product variations before continuing';
        } else if (variations.some((variant) => !((toNumber(variant?.price) ?? 0) > 0))) {
          errors.variations = 'Every variation needs a price greater than 0';
        }
      } else if (!((toNumber(formData?.regular_price) ?? 0) > 0)) {
        errors.regular_price = 'Set a price greater than 0';
      }

      break;
    }

    case 4.2: {
      const isFree = Boolean(formData?.isFreeDelivery);
      const isPaid = Boolean(formData?.isPaidDelivery);

      if (!isFree && !isPaid) {
        errors.delivery = 'Select at least one delivery option';
      }

      if (isFree) {
        const hasSavedAddress = !isBlank(formData?.deliveryOriginAddressId);
        const hasManualAddress =
          !isBlank(formData?.deliveryOriginAddressLine1) &&
          !isBlank(formData?.deliveryOriginCity) &&
          !isBlank(formData?.deliveryOriginPostalCode);

        if (!hasSavedAddress && !hasManualAddress) {
          errors.freeDelivery = 'Choose a delivery origin address';
        } else if (!((toNumber(formData?.freeDeliveryRadius) ?? 0) > 0)) {
          errors.freeDeliveryRadius = 'Enter a free delivery radius greater than 0';
        }
      }
      break;
    }

    default:
      break;
  }

  return errors;
}

/** Steps (in order) that must be valid before the product can be published. */
export function getProductStepsToValidate(formData: any, fulfillmentType: string[]): number[] {
  const steps = [1, 2, 3];
  const hasShipping = fulfillmentType.includes('shipping');
  if (formData?.product_type === 'physical' && (hasShipping || formData?.isFreeDelivery || formData?.isPaidDelivery)) {
    steps.push(4.2);
  }
  return steps;
}

/** Returns the first step in `steps` with validation errors, or null. */
export function findFirstInvalidProductStep(
  formData: any,
  steps: number[],
): { step: number; errors: ProductFormErrors } | null {
  for (const step of steps) {
    const errors = validateProductStep(step, formData);
    if (Object.keys(errors).length > 0) {
      return { step, errors };
    }
  }
  return null;
}
