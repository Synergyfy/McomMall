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
    return <p>Loading gift cards...</p>;
  }

  if (isError) {
    return <p>There was an error fetching gift cards.</p>;
  }

  if (!templates || templates.length === 0) {
    return <p>No gift cards available for this business.</p>;
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