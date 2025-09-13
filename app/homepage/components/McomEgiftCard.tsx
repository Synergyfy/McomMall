'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const giftCards = [
  {
    id: 1,
    title: 'Prezzee Smart eGift Card',
    tag: 'Most popular gift!',
    tagColor: 'bg-purple-100 text-purple-800',
    imageUrl: 'https://placehold.co/400x250/F87171/FFFFFF?text=Prezzee',
    backgroundStyle: 'bg-gradient-to-br from-red-100 to-orange-100',
  },
  {
    id: 2,
    title: 'Supermarket Smart eGift',
    tag: 'Groceries',
    tagColor: 'bg-green-100 text-green-800',
    imageUrl: 'https://placehold.co/400x250/4ADE80/FFFFFF?text=Supermarket',
    backgroundStyle: 'bg-gradient-to-br from-green-100 to-lime-100',
  },
  {
    id: 3,
    title: 'Luxury Smart eGift Card',
    tag: 'Premium',
    tagColor: 'bg-gray-200 text-gray-800',
    imageUrl: 'https://placehold.co/400x250/374151/FFFFFF?text=Luxury',
    backgroundStyle:
      "bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23d1d5db%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]",
  },
  {
    id: 4,
    title: 'Jurassic World Rebirth',
    tag: 'Special Edition',
    tagColor: 'bg-blue-100 text-blue-800',
    imageUrl: 'https://placehold.co/400x250/60A5FA/FFFFFF?text=Jurassic+World',
    backgroundStyle: 'bg-gradient-to-br from-sky-100 to-indigo-100',
  },
  {
    id: 5,
    title: 'Air Edition Smart eGift',
    tag: 'Special Edition',
    tagColor: 'bg-blue-100 text-blue-800',
    imageUrl: 'https://placehold.co/400x250/38BDF8/FFFFFF?text=Air+Edition',
    backgroundStyle: 'bg-gradient-to-br from-cyan-100 to-blue-100',
  },
  {
    id: 6,
    title: "Gamer's Choice Card",
    tag: 'Gaming',
    tagColor: 'bg-red-100 text-red-800',
    imageUrl: 'https://placehold.co/400x250/F472B6/FFFFFF?text=Gaming',
    backgroundStyle:
      'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]',
  },
  {
    id: 7,
    title: 'Movie Night eGift',
    tag: 'Entertainment',
    tagColor: 'bg-yellow-100 text-yellow-800',
    imageUrl: 'https://placehold.co/400x250/FBBF24/FFFFFF?text=Movies',
    backgroundStyle: 'bg-gradient-to-br from-amber-100 to-yellow-100',
  },
];

export function McomEgiftCard() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // Calculate the scroll amount, e.g., 80% of the container's width
      const scrollAmount = current.offsetWidth * 0.8;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen w-full font-sans hide-scrollbar">
      <section className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
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

        {/* Gift Card Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide"
        >
          {giftCards.map((card, index) => (
            <motion.div
              key={card.id}
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
                    objectFit="cover"
                    width={100}
                    height={100}
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
                    <h3 className="font-semibold text-gray-800">
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
          ))}
        </div>

        {/* "See More" Button */}
        <div className="mt-8 flex justify-center">
          <Button className="rounded-lg bg-orange-600 px-6 py-4 text-base font-bold text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-orange-700 sm:px-8 sm:py-6 sm:text-lg">
            See more eGift Cards
          </Button>
        </div>
      </section>
    </div>
  );
}
