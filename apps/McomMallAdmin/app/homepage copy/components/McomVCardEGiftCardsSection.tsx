// src/components/McomVCardEGiftCardsSection.tsx

'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function McomVCardEGiftCardsSection() {
  return (
    <div className="bg-gray-100 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Get more local business, effortlessly
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Stop missing out on potential revenue. Grow your business by selling
            your own branded e-gift cards to your local community. See how easy
            it is.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left Card */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="relative h-60 w-full overflow-hidden bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1637070155805-e6fbee6ec2cf?q=80&w=1198&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Mockup of MCOMVCARD EGift Card on a phone"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-orange-600">
                EASY SETUP
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                From sign-up to sales: Launch in minutes
              </h3>
              <p className="mt-4 text-gray-600">
                With a simple setup process, start selling MCOMVCARD EGift Cards
                today and watch your local revenue grow.
              </p>
              <p className="mt-4 text-orange-600 font-semibold">
                Boost revenue by <span className="text-blue-700">+15%</span>{' '}
                within the first quarter.
              </p>
              <Button
                className="group mt-6 flex justify-center items-center bg-orange-600 hover:bg-orange-700 cursor-pointer text-white text-xl font-semibold"
                size={'lg'}
              >
                Learn how
                <ArrowRight
                  className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200"
                  fontSize={30}
                />
              </Button>
            </div>
          </div>

          {/* Right Card */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="relative h-60 w-full overflow-hidden bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1585314062528-0c3742fa6102?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Graphical representation of accelerated growth"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-orange-600">
                ACCELERATED GROWTH
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Unlock new revenue streams and customer loyalty
              </h3>
              <p className="mt-4 text-gray-600">
                {
                  " MCOMVCARD EGift Cards aren't just sales; they're a powerful tool for attracting new customers and building lasting loyalty within your local area."
                }
              </p>
              <p className="mt-4 text-orange-600 font-semibold">
                See a <span className="text-blue-700">+25%</span> increase in
                repeat customers through e-gift card usage.
              </p>
              <Button
                className="group mt-6 flex justify-center items-center bg-orange-600 hover:bg-orange-700 cursor-pointer text-white text-xl font-semibold"
                size={'lg'}
              >
                Explore
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
