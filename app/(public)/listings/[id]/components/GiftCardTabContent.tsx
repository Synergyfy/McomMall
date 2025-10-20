'use client';

import { useGetBusinessGiftCards } from '@/service/gift-card/hook';
import { GiftCardTemplate } from '@/service/gift-card/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface GiftCardTabContentProps {
  businessId: string;
}

export default function GiftCardTabContent({ businessId }: GiftCardTabContentProps) {
  const { data: templates, isPending, isError } = useGetBusinessGiftCards(businessId);
  const router = useRouter();

  if (isPending) {
    return (
      <div className="space-y-4 mt-4">
        <div className="bg-gray-100 p-6 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 bg-red-50 p-4 rounded-lg">
        <h4 className="font-bold">Error</h4>
        <p>Could not load gift cards at this time. Please try again later.</p>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 rounded-lg mt-6">
        <h4 className="text-lg font-semibold text-gray-700">
          No Gift Cards Available
        </h4>
        <p className="text-gray-500 mt-2">
          This business does not have any gift cards available at the moment.
          Check back later!
        </p>
      </div>
    );
  }

  const handleBuyNow = (template: GiftCardTemplate) => {
    router.push(`/listings/${businessId}/gift-card?templateId=${template.id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div key={template.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105">
          <div className="relative h-48 w-full">
            <Image
              src={template.backgroundImageUrl || 'https://via.placeholder.com/400x200'}
              alt={template.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            {template.bonusThreshold && template.bonusAmount && (
                <div className="mt-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                        Buy for £{template.bonusThreshold} and get £{template.bonusAmount} extra!
                    </span>
                </div>
            )}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700">Available Amounts:</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {template.fixedAmounts?.map((amount) => (
                  <span key={amount} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                    £{amount}
                  </span>
                ))}
                {template.allowCustomAmount && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Custom ( £{template.minCustomAmount} - £{template.maxCustomAmount} )
                  </span>
                )}
              </div>
            </div>
            <Button
              className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => handleBuyNow(template)}
            >
              Buy Now
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}