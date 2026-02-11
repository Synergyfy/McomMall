'use client';

import { useSearchParams } from 'next/navigation';
import Auth from './auth';

const AuthWithRedirect = ({ children }: { children?: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  return <Auth redirect={redirect}>{children}</Auth>;
};

export default AuthWithRedirect;
