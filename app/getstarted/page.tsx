'use client';
import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const options: OptionKey[] = [
  'AGENT',
  'ACCOUNT MANAGER',
  'CONSULTANTS',
];

const optionInfo = {
  'CHOOSE YOUR STATUS': 'INFORMATION ABOUT THE OPTION CHOSEN AFTER THE OPTION IS SELECTED.',
  'AGENT': 'Information for AGENT: Access your dashboard, manage client requests, and track your earnings.',
  'ACCOUNT MANAGER': 'Information for ACCOUNT MANAGER: Oversee your portfolio of clients and manage support tickets.',
  'CONSULTANTS': 'Information for CONSULTANTS: Offer your expertise, manage your availability, and connect with businesses.',
};

type OptionKey = keyof typeof optionInfo;

export default function GetStartedPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OptionKey>('CHOOSE YOUR STATUS');

  const handleSelect = (option: OptionKey) => {
    setSelectedStatus(option);
    setIsOpen(false);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center text-white">
      <Image
        src="/getstartedpage/getstartedimage.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="-z-10"
      />
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />

      <div className="z-20 flex w-full max-w-4xl flex-col md:flex-row items-center justify-center gap-8 px-8 text-center">
        {/* Left Side: Buy and Sell on MCOM */}
        <div className="w-full md:w-1/2 p-6 bg-white/10 backdrop-blur-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4">BUY AND SELL ON MCOM</h2>
          <div className="w-full h-48 bg-gray-700 rounded-md mb-4">
            {/* Placeholder for an image or video */}
          </div>
          <Link
            href="/signup"
            className="w-full max-w-sm rounded-lg bg-orange-600 py-3 text-lg font-semibold text-white transition-transform hover:scale-105"
          >
            Create Account
          </Link>
        </div>

        {/* Right Side: Earn with MCOM */}
        <div className="w-full md:w-1/2 p-6 bg-white/10 backdrop-blur-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4">EARN WITH MCOM</h2>
          <div className="relative w-full">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-between rounded-lg bg-white/20 p-3 text-left text-lg font-semibold uppercase tracking-wide"
            >
              {selectedStatus}
              <ChevronDownIcon
                className={`h-6 w-6 text-gray-400 transition-transform ${
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
          <p className="pt-4 mt-4 text-center text-xs uppercase tracking-wide text-gray-400">
            {optionInfo[selectedStatus]}
          </p>
        </div>
      </div>
    </main>
  );
}