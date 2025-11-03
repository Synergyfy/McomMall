'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const options: OptionKey[] = [
  'AGENT',
  'ACCOUNT MANAGER',
  'CONSULTANTS',
];

const optionInfo = {
  'CHOOSE YOUR STATUS': 'Select a role to see more information.',
  'AGENT': 'Access your dashboard, manage client requests, and track your earnings.',
  'ACCOUNT MANAGER': 'Oversee your portfolio of clients and manage support tickets.',
  'CONSULTANTS': 'Offer your expertise, manage your availability, and connect with businesses.',
};

type OptionKey = keyof typeof optionInfo;

export default function GetStartedPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<OptionKey>('CHOOSE YOUR STATUS');
  const [infoText, setInfoText] = useState(
    'Select a role to see more information.'
  );

  const handleSelect = (option: OptionKey) => {
    setSelectedStatus(option);
    setInfoText(optionInfo[option]);
    setIsOpen(false);
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col text-white md:flex-row">
      {/* Absolute positioned header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pt-16 text-center">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
          <span className="text-sm font-bold text-white">M</span>
        </div>
        <h1 className="text-4xl font-bold">Lets Make living life easier.</h1>
      </div>

      {/* Left Section (40%) */}
      <div
        className="relative flex h-screen w-full flex-col items-center justify-center p-8 text-center md:w-2/5"
      >
        <Image
          src="/getstartedpage/getstartedimage.jpg"
          alt="Earn with Us"
          layout="fill"
          objectFit="cover"
          quality={80}
          className="-z-10"
        />
        <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />
        <div className="w-full max-w-sm pt-40">
          {' '}
          {/* Increased pt for header clearance */}
          <h2 className="mb-6 text-2xl font-semibold">Earn with Us</h2>
          <div className="relative w-full text-left">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-between rounded-md border border-gray-600 px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide"
            >
              {selectedStatus}
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="absolute top-full z-10 mt-2 w-full rounded-md bg-white py-2 text-black shadow-lg">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="block w-full px-4 py-2 text-left text-sm uppercase tracking-wider hover:bg-gray-100"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-4 min-h-[40px] text-xs uppercase tracking-wide text-gray-400">
            {infoText}
          </p>
          <Link
            href="/signup"
            className="mt-6 block w-full rounded-lg bg-orange-600 py-3 text-center text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-700"
          >
            Continue
          </Link>
        </div>
      </div>

      {/* Right Section (60%) */}
      <div
        className="relative flex h-screen w-full flex-col items-center justify-center p-8 text-center md:w-3/5"
      >
        <Image
          src="/getstartedpage/getstartedimage.jpg"
          alt="Buy and Sell on Mcom"
          layout="fill"
          objectFit="cover"
          quality={80}
          className="-z-10"
        />
        <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />
        <div className="w-full max-w-sm pt-40">
          {' '}
          {/* Increased pt for header clearance */}
          <h2 className="mb-6 text-2xl font-semibold">Buy and Sell on Mcom</h2>
          <p className="mb-6 text-gray-300">
            Join our marketplace to discover, buy, and sell products and
            services with ease.
          </p>
          <Link
            href="/signup"
            className="mb-4 block w-full rounded-lg bg-white py-3 text-lg font-semibold text-gray-900 transition-transform hover:scale-105"
          >
            Create Account
          </Link>
          <p className="text-gray-200">
            I already have an account.{' '}
            <Link
              href="/signin"
              className="font-semibold text-white underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Absolute positioned footer */}
      <p className="absolute bottom-6 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-4 text-center text-xs text-gray-400">
        By proceeding to use McomMall, you agree to our{' '}
        <Link href="/terms" className="underline">
          terms of use
        </Link>{' '}
        and acknowledge that you have read our{' '}
        <Link href="/privacy" className="underline">
          privacy policy
        </Link>
        .
      </p>
    </main>
  );
}
