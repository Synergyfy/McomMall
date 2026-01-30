'use client';

import Auth from '@/components/auth';
import { Suspense } from 'react';

const SignUpPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Auth redirect={null} />
    </Suspense>
  );
};

export default SignUpPage;
