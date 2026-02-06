'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function RememberMe() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Remember Me</Label>
        </div>
        <p className="text-sm text-gray-600">
          Don&apos;t have an account ?{' '}
          <Link href="/getstarted" className="text-orange-500 hover:text-orange-600 font-bold">
            Click here to sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
