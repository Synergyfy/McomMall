'use client';

import { useParams } from 'next/navigation';
import { useGetGiftCardTemplateById } from '@/service/gift-card/hook';
import { Loader, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import ServiceSafetyCard from '@/app/(public)/services/[id]/components/ServiceSafetyCard';
import ServiceGallery from '@/app/(public)/services/[id]/components/ServiceGallery';

export default function GiftCardPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: giftCard, isLoading, isError } = useGetGiftCardTemplateById(id || '');

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><Loader className="animate-spin text-orange-600" size={48} /></div>;
  }

  if (isError || !giftCard) {
    return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><p className="text-xl text-red-500">Gift Card not found.</p></div>;
  }

  const handlePurchase = () => {
      toast.success("Purchase initiated (Demo)");
  };

  const images = giftCard.imageUrl ? [giftCard.imageUrl] : ['/placeholder.png'];

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
                    <ServiceGallery images={images} title={giftCard.name} />
                    <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{giftCard.name}</h2>
                        <p className="text-gray-700">{giftCard.description || "No description available."}</p>
                    </div>
                </div>

                <div className="relative">
                    <div className="sticky top-20 space-y-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Gift Card</h1>
                            {/* Logic for amount selection would go here */}
                            <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700" onClick={handlePurchase}>
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
