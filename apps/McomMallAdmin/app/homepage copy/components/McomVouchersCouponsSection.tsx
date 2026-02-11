'use client';

import React from 'react';
import Image from 'next/image';
import { Ticket, Percent, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function McomVouchersCouponsSection() {
  return (
    <div className="bg-gray-100 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Boost local sales with smart offers
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            {
              "Attract new customers and reward loyal ones with MCOMVOUCHERS and MCOMCOUPONS. It's the simple way to grow locally."
            }
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left Card: MCOMVOUCHERS */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="relative h-60 w-full overflow-hidden bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1617992477211-dfab5866182b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Mockup of MCOMVOUCHER"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-orange-600">
                EASY ENGAGEMENT
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Drive foot traffic with appealing MCOMVOUCHERS
              </h3>
              <p className="mt-4 text-gray-600">
                Offer special deals and promotions effortlessly. MCOMVOUCHERS
                are designed to be easily shareable and redeemable, bringing
                more customers to your door.
              </p>
              <p className="mt-4 text-orange-600 font-semibold">
                Increase customer visits by{' '}
                <span className="text-green-500">+20%</span> with enticing
                voucher offers.
              </p>
              <Button
                className="group mt-6 flex justify-center items-center bg-orange-600 hover:bg-orange-700 cursor-pointer text-white text-xl font-semibold"
                size={'lg'}
              >
                See how it works
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>

          {/* Right Card: MCOMCOUPONS */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="relative h-60 w-full overflow-hidden bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1706759755964-b0aa57a58c5a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Graphical representation of coupon benefits"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-orange-600">
                TARGETED OFFERS
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Reach the right audience with strategic MCOMCOUPONS
              </h3>
              <p className="mt-4 text-gray-600">
                Create custom coupon campaigns to target specific customer
                segments, track performance, and maximize the impact of your
                promotions.
              </p>
              <p className="mt-4 text-orange-600 font-semibold">
                Achieve a <span className="text-blue-500">+18%</span> conversion
                rate with well-targeted coupon strategies.
              </p>
              <Button
                className="group mt-6 flex justify-center items-center bg-orange-600 hover:bg-orange-700 cursor-pointer text-white text-xl font-semibold"
                size={'lg'}
              >
                Explore targeting options{' '}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
