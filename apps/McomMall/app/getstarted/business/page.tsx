import { redirect } from 'next/navigation';

/**
 * Business profiles (listings) are owned by the MCOM Central Hub Solution.
 * The legacy in-mall onboarding flow that created a listing locally has been
 * removed, so merchants are sent to Central to create or update their business.
 */
export default function GetStartedBusinessPage() {
  const solutionsUrl =
    process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000';

  redirect(`${solutionsUrl}/getstarted/business?source=mcommall`);
}
