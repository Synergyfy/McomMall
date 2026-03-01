'use client';

import { useParams } from 'next/navigation';
import { useGetServiceById } from '@/service/services/hook';
import { useGetWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/service/wishlist/hook';
import { Loader, ChevronLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import ServiceGallery from './components/ServiceGallery';
import ServiceSellerCard from './components/ServiceSellerCard';
import ServiceSafetyCard from './components/ServiceSafetyCard';
import ServiceFacts from './components/ServiceFacts';
import ServiceBookingWidget from './components/ServiceBookingWidget';
import ServiceAvailabilityOverview from './components/ServiceAvailabilityOverview';
import PlusItemsSection from '@/components/marketplace/PlusItemsSection';
import { useGetServicePlusItems } from '@/service/partnerships/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function ServicePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data: service, isLoading, isError } = useGetServiceById(id || '');
  const { data: wishlist } = useGetWishlist();
  const { mutateAsync: addToWishlist, isPending: isAddingToWishlist } = useAddToWishlist();
  const { mutateAsync: removeFromWishlist, isPending: isRemovingFromWishlist } = useRemoveFromWishlist();
  const { data: plusItems } = useGetServicePlusItems(id || '');
  const [plusItemsDialogOpen, setPlusItemsDialogOpen] = useState(false);

  const isInWishlist = useMemo(() => {
    return wishlist?.items?.some(item => (item.product?.id === id) || (item.service?.id === id));
  }, [wishlist, id]);

  const handleWishlistAction = async () => {
    if (!id) return;
    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ productId: id });
        toast.success('Added to wishlist');
        if (plusItems && plusItems.length > 0) {
            setPlusItemsDialogOpen(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 pt-16">
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 pt-16">
        <p className="text-xl text-red-500">Service not found.</p>
      </div>
    );
  }

  const images = service.media && service.media.length > 0
    ? service.media
    : ['/placeholder.png'];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-3">

      {/* Navigation / Breadcrumb */}
      <div className="bg-white border-b shadow-sm mb-6">
        <div className="container mx-auto px-4 h-14 flex items-center">
            <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Listings
            </Link>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">

             {/* Header (Mobile Only) */}
             <div className="lg:hidden">
              <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
              <p className="text-gray-500 mt-1">Service</p>
            </div>

            {/* Gallery */}
            <ServiceGallery images={images} title={service.name} />

            {/* Description */}
            <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
               <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
               <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {service.description || "No description provided."}
               </p>
            </div>

            {/* Service Facts */}
            <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <ServiceFacts service={service} />
            </div>

            {/* Availability Overview */}
            <ServiceAvailabilityOverview service={service} />

            {/* Plus Items Section */}
            {plusItems && plusItems.length > 0 && (
                <div className="bg-white rounded-xl p-6 md:p-8 border border-orange-100 shadow-sm ring-4 ring-orange-50/50">
                    <PlusItemsSection items={plusItems} />
                </div>
            )}

            <Dialog open={plusItemsDialogOpen} onOpenChange={setPlusItemsDialogOpen}>
                <DialogContent className="max-w-3xl bg-white rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900">Elevate Your Service!</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Add these partner products or services to get the most out of your booking.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <PlusItemsSection items={plusItems || []} />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setPlusItemsDialogOpen(false)} className="font-bold text-slate-500">Close</Button>
                        <Button onClick={() => router.push('/cart')} className="bg-slate-900 text-white font-bold rounded-xl px-6">Go to Cart</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="relative">
             {/* Sticky Wrapper */}
             <div className="sticky top-20 space-y-6">

                {/* Wishlist Button */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <Button
                    variant="outline"
                    className="w-full py-4 h-auto border-gray-100 text-gray-700 hover:bg-gray-50 transition-all gap-2 font-bold"
                    onClick={handleWishlistAction}
                    disabled={isAddingToWishlist || isRemovingFromWishlist}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </Button>
                </div>

                {/* Booking Widget */}
                <ServiceBookingWidget service={service} />

                {/* Seller Card */}
                <ServiceSellerCard business={service.business} />

                {/* Safety Card */}
                <ServiceSafetyCard />

             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
