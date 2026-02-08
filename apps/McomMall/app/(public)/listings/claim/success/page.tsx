'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function ClaimSuccessPage() {
  const router = useRouter();

  const handleGoToMyListings = () => {
    router.push('/dashboard/my-listings');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Business Claimed Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was successful and the listing is now claimed.
        </p>
        <Button onClick={handleGoToMyListings}>Go to My Listings</Button>
      </div>
    </div>
  );
}
