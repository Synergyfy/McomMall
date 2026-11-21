/**
 * Business ownership used for products created by MCOM Mall admins.
 *
 * Business-created products keep their own businessId. Admin-created products
 * are assigned to this dedicated platform business so the two groups can be
 * separated in the admin catalog without guessing from business names.
 *
 * Set NEXT_PUBLIC_MCOM_PLATFORM_BUSINESS_ID to the real platform business ID
 * in the admin app's environment. The fallback never matches a real UUID, so
 * existing products are treated as business-created until it is configured.
 */
export const PLATFORM_BUSINESS_ID =
    process.env.NEXT_PUBLIC_MCOM_PLATFORM_BUSINESS_ID ?? '__platform_business_not_configured__';

export function isAdminCreatedProduct(businessId?: string | null): boolean {
    return Boolean(businessId) && businessId === PLATFORM_BUSINESS_ID;
}
