'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingSuccessClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const refreshMembership = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['my-membership'] });
        await queryClient.refetchQueries({ queryKey: ['my-membership'] });
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };

    refreshMembership();
  }, [queryClient]);

  if (status === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">
          Confirming your subscription...
        </h2>
        <p className="text-gray-600 mt-2">
          Please wait while we update your account.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Something went wrong
        </h2>
        <p className="text-gray-600 mt-2 mb-6">
          We couldn&apos;t confirm your subscription. Please try again.
        </p>
        <Button
          onClick={() => router.push('/dashboard/my-subscription')}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Go to My Subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Subscription Activated!
      </h2>
      <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
        Your plan is now active. All platform features have been unlocked for your account.
      </p>
      <Button
        size="lg"
        onClick={() => router.push('/dashboard')}
        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg shadow-orange-200 transition-all hover:shadow-xl hover:shadow-orange-300"
      >
        Go to Dashboard
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
