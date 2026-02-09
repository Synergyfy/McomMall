'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  useGetPublicGiftCardTemplates,
  useGetPublicCouponProducts,
  useGetPublicVoucherProducts,
} from '@/service/system/hook';

interface McomItem {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  imageUrl: string;
  backgroundStyle: string;
  type: 'giftcard' | 'coupon' | 'voucher';
}

export function McomEgiftCard() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { data: giftCardsData, isLoading: loadingGC } =
    useGetPublicGiftCardTemplates(5);
  const { data: couponsData, isLoading: loadingCoupons } =
    useGetPublicCouponProducts(5);
  const { data: vouchersData, isLoading: loadingVouchers } =
    useGetPublicVoucherProducts(5);

  const mixedItems = useMemo(() => {
    const items: McomItem[] = [];

    if (giftCardsData?.data) {
      giftCardsData.data.forEach((gc: any) => {
        items.push({
          id: gc.id,
          title: gc.name,
          tag: 'eGift Card',
          tagColor: 'bg-orange-100 text-orange-800',
          imageUrl: gc.backgroundImageUrl || 'https://placehold.co/400x250/F87171/FFFFFF?text=Gift+Card',
          backgroundStyle: 'bg-gradient-to-br from-red-100 to-orange-100',
          type: 'giftcard',
        });
      });
    }

    if (couponsData?.data) {
      couponsData.data.forEach((coupon: any) => {
        items.push({
          id: coupon.id,
          title: coupon.name,
          tag: 'Coupon',
          tagColor: 'bg-blue-100 text-blue-800',
          imageUrl: coupon.backgroundImage || 'https://placehold.co/400x250/60A5FA/FFFFFF?text=Coupon',
          backgroundStyle: 'bg-gradient-to-br from-sky-100 to-indigo-100',
          type: 'coupon',
        });
      });
    }

    if (vouchersData?.data) {
      vouchersData.data.forEach((voucher: any) => {
        items.push({
          id: voucher.id,
          title: voucher.name,
          tag: 'Voucher',
          tagColor: 'bg-green-100 text-green-800',
          imageUrl: voucher.backgroundImage || 'https://placehold.co/400x250/4ADE80/FFFFFF?text=Voucher',
          backgroundStyle: 'bg-gradient-to-br from-green-100 to-lime-100',
          type: 'voucher',
        });
      });
    }

    // Randomize the mix
    return items.sort(() => Math.random() - 0.5);
  }, [giftCardsData, couponsData, vouchersData]);

  const isLoading = loadingGC || loadingCoupons || loadingVouchers;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.offsetWidth * 0.8;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen w-full font-sans hide-scrollbar">
      <section className="max-w-[1600px] mx-auto px-8 py-12 md:py-16 lg:py-20">
        {/* Header Section */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {"There's a Mcom for that"}
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              {
                "Whether it's a favourite brand, a gift of choice or even a mix of both, we've got you covered!"
              }
            </p>
          </div>
          {/* Desktop Navigation Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              aria-label="Scroll Left"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              aria-label="Scroll Right"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide"
        >
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-20">
              <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
            </div>
          ) : (
            mixedItems.map((card, index) => (
              <motion.div
                key={`${card.type}-${card.id}`}
                className="flex-shrink-0 w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className="overflow-hidden h-full flex flex-col group transition-shadow duration-300 hover:shadow-xl">
                  <div
                    className={`aspect-[16/10] overflow-hidden ${card.backgroundStyle}`}
                  >
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      width={400}
                      height={250}
                      className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src =
                          'https://placehold.co/400x250/CCCCCC/FFFFFF?text=Image+Error';
                      }}
                    />
                  </div>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 line-clamp-2">
                        {card.title}
                      </h3>
                    </div>
                    {card.tag && (
                      <span
                        className={`mt-3 text-xs font-medium mr-auto px-2.5 py-1 rounded-full ${card.tagColor}`}
                      >
                        {card.tag}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* "See More" Button */}
        <div className="mt-8 flex justify-center">
          <Button className="rounded-lg bg-orange-600 px-6 py-4 text-base font-bold text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-orange-700 sm:px-8 sm:py-6 sm:text-lg">
            See more options
          </Button>
        </div>
      </section>
    </div>
  );
}
