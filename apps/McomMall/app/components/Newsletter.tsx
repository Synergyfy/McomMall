'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Newsletter() {
  return (
    // Section container with a bottom border
    <div className="border-b border-slate-800 bg-slate-900">
      {/* Inner container with padding and a subtle background glow effect */}
      <div className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="absolute inset-0 top-60">
          <div className="mx-auto max-w-7xl h-96 bg-gradient-to-r from-orange-600/20 to-purple-600/20 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Main heading with a striking gradient text effect */}
          <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 sm:text-5xl">
            Get Notified First
          </h2>

          {/* Subheading with improved-readability text color */}
          <p className="mt-4 text-lg max-w-2xl mx-auto text-slate-400">
            Join our exclusive newsletter for early access to new features,
            special offers, and insider updates.
          </p>

          {/* Form with a more compact and modern layout */}
          <form className="mt-10 max-w-lg mx-auto sm:flex sm:gap-x-4">
            <div className="min-w-0 flex-1">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                className="block w-full h-14 px-5 py-3 text-base text-white placeholder-slate-500 bg-slate-800/80 border border-slate-700 rounded-full shadow-sm focus:ring-orange-500 focus:border-orange-500 backdrop-blur-sm"
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:flex-shrink-0">
              <Button
                type="submit"
                className="block w-full h-14 px-6 text-base font-bold text-white bg-orange-600 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500"
              >
                Subscribe
              </Button>
            </div>
          </form>

          {/* A small note to build trust and reassure users */}
          <p className="mt-5 text-sm text-slate-500 z-[1000]">
            We care about your data. Read our{' '}
<<<<<<< HEAD
            <Link href="/privacy-policy" className="underline hover:text-slate-400">
=======
            <Link href="/privacy-policy" className="underline hover:text-slate-400 z-[1000000]">
>>>>>>> ff401fadfec72e88dbd07aad46cbc813fb86a4fa
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
