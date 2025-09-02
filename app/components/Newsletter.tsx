'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function Newsletter() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Join Our Newsletter
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          Stay up to date with our latest news, offers, and promotions.
        </p>
        <form className="mt-8 sm:flex">
          <div className="min-w-0 flex-1">
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <Input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              className="block w-full px-5 py-3 text-base text-gray-900 placeholder-gray-500 bg-slate-800 border-slate-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-3 min-w-0 flex-1">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              className="block w-full px-5 py-3 text-base text-gray-900 placeholder-gray-500 bg-slate-800 border-slate-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-3">
            <Button
              type="submit"
              className="block w-full px-5 py-3 text-base font-medium text-white bg-orange-600 border border-transparent rounded-md shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Mail className="mr-2 h-5 w-5" />
              Join Newsletter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
