'use client';

import Auth from '@/components/auth';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const SignInContent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const bookService = searchParams.get('bookService');
  const activeSection = searchParams.get('activeSection');
  
  // Reconstruct the final redirect URL including query params if necessary
  let finalRedirect = callbackUrl;
  if (callbackUrl) {
    const url = new URL(callbackUrl, window.location.origin);
    if (bookService) url.searchParams.set('bookService', bookService);
    if (activeSection) url.searchParams.set('activeSection', activeSection);
    finalRedirect = url.toString();
  }

  return <Auth redirect={finalRedirect} />;
};

const SignInPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
};

export default SignInPage;