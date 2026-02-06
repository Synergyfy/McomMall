'use client';

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetGiftCardTemplateById } from '@/service/gift-card/hook';
import { Loader, ChevronLeft, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ServiceSafetyCard from '@/app/(public)/services/[id]/components/ServiceSafetyCard';
import ServiceGallery from '@/app/(public)/services/[id]/components/ServiceGallery';
import { useMarketplaceContext } from '@/context/MarketplaceContext';
import NewGiftCardFlow from '@/components/gift-card/NewGiftCardFlow';
import { GiftCardTemplate } from '@/service/gift-card/types';

export default function GiftCardPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { selectedItem } = useMarketplaceContext();
  const cachedItem = selectedItem && String(selectedItem.id) === String(id) ? selectedItem : null;

  const { data: giftCard, isLoading, isError } = useGetGiftCardTemplateById(id || '', {
    enabled: !cachedItem
  });

  const displayGiftCard = (cachedItem || giftCard) as GiftCardTemplate;
  const [isBuying, setIsBuying] = useState(false);

  if (!displayGiftCard && isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><Loader className="animate-spin text-orange-600" size={48} /></div>;
  }

  if ((!displayGiftCard && isError) || (!displayGiftCard && !isLoading)) {
    return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><p className="text-xl text-red-500">Gift Card not found.</p></div>;
  }

  const handleBuyNow = () => {
    setIsBuying(true);
  };

  if (isBuying && displayGiftCard) {
      return (
          <div className="min-h-screen bg-gray-50 pb-12 pt-3">
              <div className="container mx-auto px-4 py-4">
                  <Button variant="ghost" onClick={() => setIsBuying(false)} className="mb-4">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Details
                  </Button>
                  <NewGiftCardFlow template={displayGiftCard} />
              </div>
          </div>
      )
  }

  const safeGC = displayGiftCard as any;
  const name = safeGC.name || safeGC.title || 'Gift Card';
  const description = safeGC.description || "No description available.";
  
  const images = (safeGC.media && safeGC.media.length > 0)
    ? safeGC.media
    : (safeGC.imageUrl 
        ? [safeGC.imageUrl] 
        : (safeGC.backgroundImageUrl 
            ? [safeGC.backgroundImageUrl] 
            : (safeGC.image ? [safeGC.image] : ['/placeholder.png'])));

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-3">
        <div className="bg-white border-b shadow-sm mb-6">
            <div className="container mx-auto px-4 h-14 flex items-center">
                <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Listings
                </Link>
            </div>
        </div>

        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ServiceGallery images={images} title={name} />
                    <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{name}</h2>
                        <p className="text-gray-700">{description}</p>
                    </div>
                </div>

                <div className="relative">
                    <div className="sticky top-20 space-y-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Purchase Gift Card</h1>
                            
                            {/* Bonus Offer Display */}
                            {displayGiftCard.bonusThreshold && displayGiftCard.bonusAmount && (
                                <div className="mb-6 rounded-lg bg-green-50 p-3 border border-green-100">
                                    <p className="font-bold text-green-700 text-sm">🎉 Special Bonus Offer!</p>
                                    <p className="text-green-800 text-sm mt-1">
                                        Buy for <span className="font-bold">£{displayGiftCard.bonusThreshold}</span> or more and get an extra <span className="font-bold">£{displayGiftCard.bonusAmount}</span> free!
                                    </p>
                                </div>
                            )}

                            {/* Pricing Options Display */}
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Available Amounts:</p>
                                <div className="flex flex-wrap gap-2">
                                    {displayGiftCard.fixedAmounts?.map((amt) => (
                                        <span key={amt} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                            £{amt}
                                        </span>
                                    ))}
                                    {displayGiftCard.allowCustomAmount && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            Custom (£{displayGiftCard.minCustomAmount} - £{displayGiftCard.maxCustomAmount})
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleBuyNow}>
                                <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now
                            </Button>
                        </div>
                        <ServiceSafetyCard />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
