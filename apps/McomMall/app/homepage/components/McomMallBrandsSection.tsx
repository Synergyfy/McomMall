'use client';

import React from 'react';
import { ParticipationSection } from './ExibitionParticipationSection';

export function McomMallBrandsSection() {
  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Shop from Over <span className="text-orange-600">600</span> Top Brands
        </h2>
        <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-600">
          {
            "Discover an exceptional shopping experience at Mcom Mall where you can touch, feel, and test a wide range of products for your home, garden, and lifestyle. Explore an unparalleled selection of exhibitors, featuring unique finds from independent retailers alongside your favourite high street brands - all under one roof. Don't miss this chance to shop, discover, and be inspired!"
          }
        </p>
        <div className="mt-8">
          <a
            href="#"
            className="rounded-md bg-orange-600 px-6 py-3 text-sm md:text-lg font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-800"
          >
            View all exhibitors
          </a>
        </div>
      </div>
      <section className="mt-[2rem]">
        <ParticipationSection />
      </section>
    </div>
  );
}
