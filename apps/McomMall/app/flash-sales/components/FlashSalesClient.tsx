'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { promotionalItems } from '@/lib/listing-data';

export default function FlashSalesClient() {
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 11, seconds: 1 });

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  return (
    <div className="bg-gray-100 pt-28">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-md mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold">Flash Sales</h2>
              <div className="text-xl">
                Time Left: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {promotionalItems.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer">
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      width={200}
                      height={200}
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium group-hover:underline">{item.title}</p>
                    <p className="text-lg font-semibold mt-2">${(item.discountedPrice ?? item.price).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 line-through">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
