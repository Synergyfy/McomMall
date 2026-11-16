/**
 * MCOM Central Hub owns business profiles (listings). The mall only renders
 * the synced profile, so create/update actions point back to Central.
 */
export const MCOM_SOLUTIONS_URL = (
  process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

export const CENTRAL_BUSINESS_PROFILE_URL = `${MCOM_SOLUTIONS_URL}/dashboard/business-profile`;
export const CENTRAL_BUSINESS_ONBOARDING_URL = `${MCOM_SOLUTIONS_URL}/getstarted/business?source=mcommall`;
