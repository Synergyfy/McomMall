'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ClipboardCheck,
  BarChart,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StockAuditSection() {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ['0%', '100%']);

  return (
    <div ref={targetRef} className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-12">
          {/* Left Column: Image */}
          <div className="lg:col-span-6">
            <div className="text-left">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Optimize Operations with Intelligent Stock & Capacity Management
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Unlock peak efficiency by transforming how you manage inventory
                and operational availability. Our integrated tools provide
                crystal-clear visibility into your stock levels and available
                capacity, empowering you to make data-driven decisions.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <ClipboardCheck className="absolute left-1 top-1 h-5 w-5 text-blue-700" />
                    Real-Time Stock Auditing.
                  </dt>
                  <dd className="inline">
                    {' '}
                    Eliminate guesswork with a live overview of your inventory.
                    Track stock movements, prevent shortages, and reduce
                    overstocking with precise, automated auditing.
                  </dd>
                </div>
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <BarChart className="absolute left-1 top-1 h-5 w-5 text-blue-700" />
                    Predictive Analytics.
                  </dt>
                  <dd className="inline">
                    {' '}
                    Forecast future demand with accuracy. Our system analyzes
                    historical data to help you anticipate inventory needs and
                    optimize your purchasing strategy.
                  </dd>
                </div>
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <CalendarClock className="absolute left-1 top-1 h-5 w-5 text-blue-700" />
                    Spare Capacity Monetization.
                  </dt>
                  <dd className="inline">
                    {' '}
                    Turn downtime into revenue. Intelligently manage and
                    advertise your available service slots or production
                    capacity to attract new business and maximize resource
                    utilization.
                  </dd>
                </div>
                <Button className="bg-orange-600 text-white hover:bg-orange-700 md:text-2xl md:h-[3rem] md:w-[14rem] rounded-none cursor-pointer flex justify-center items-center ">
                  Learn More
                  <ArrowRight size={300} />
                </Button>
              </dl>
            </div>
          </div>

          {/* Middle Column: Animated Line */}
          <div className="hidden lg:flex lg:col-span-1 lg:justify-center">
            <div className="relative h-full w-1 bg-gray-200 rounded-full">
              <motion.div
                className="absolute top-0 left-0 w-full bg-blue-600 rounded-full"
                style={{ height: lineHeight }}
              />
            </div>
          </div>

          {/* Right Column: Content */}

          <div className="lg:col-span-5">
            <div className="relative h-[500px] w-full overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Warehouse inventory being audited"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
