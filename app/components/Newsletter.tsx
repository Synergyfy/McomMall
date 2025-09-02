'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function Newsletter() {
  return (
    <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
          Stay in the Loop
        </h2>
        <p className="mt-4 text-xl text-slate-400">
          Join our newsletter to get the latest news, offers, and promotions
          delivered right to your inbox.
        </p>
        <form className="mt-10 max-w-lg mx-auto sm:flex">
          <div className="min-w-0 flex-1">
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <Input
              type="text"
              name="name"
              id="name"
              placeholder="Your Name"
              className="block w-full h-14 px-5 py-3 text-lg text-white placeholder-slate-500 bg-slate-800 border-slate-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 min-w-0 flex-1">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Your Email"
              className="block w-full h-14 px-5 py-3 text-lg text-white placeholder-slate-500 bg-slate-800 border-slate-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <Button
              type="submit"
              className="block w-full h-14 px-6 py-3 text-lg font-bold text-white bg-orange-600 border border-transparent rounded-md shadow-lg transform transition-transform duration-200 hover:scale-105 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Mail className="mr-3 h-6 w-6" />
              Subscribe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
