'use client';

import Auth from '@/components/auth';
import { Suspense } from 'react';

const SignInPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Auth redirect={null} />
    </Suspense>
  );
};

export default SignInPage;
