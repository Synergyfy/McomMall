'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // Icon

// --- List of options for the dropdown ---
// CHANGE 1: We explicitly type the options array (see CHANGE 2)
// This array does NOT include the default "CHOOSE YOUR STATUS"
const options: OptionKey[] = [
  'BUSINESS',
  'CUSTOMER',
  // 'AGENT',
  // 'ACCOUNT MANAGER',
  // 'CONSULTANTS',
];

// --- Descriptions for each option ---
const optionInfo = {
  'CHOOSE YOUR STATUS': 'INFORMATION ABOUT THE OPTION CHOSEN AFTER THE OPTION IS SELECTED.',
  'BUSINESS': 'Information for BUSINESS: Manage your company profile, post jobs, and access corporate services.',
  'CUSTOMER': 'Information for CUSTOMER: Browse services, manage your bookings, and track your history.',
  // 'AGENT': 'Information for AGENT: Access your dashboard, manage client requests, and track your earnings.',
  // 'ACCOUNT MANAGER': 'Information for ACCOUNT MANAGER: Oversee your portfolio of clients and manage support tickets.',
  // 'CONSULTANTS': 'Information for CONSULTANTS: Offer your expertise, manage your availability, and connect with businesses.',
};

// CHANGE 2: Create a type from the keys of optionInfo
type OptionKey = keyof typeof optionInfo;

export default function RegisterPage() {
  // --- State Management ---
  const [isOpen, setIsOpen] = useState(false);
  
  // CHANGE 3: Tell useState it will hold a value of type OptionKey
  const [selectedStatus, setSelectedStatus] = useState<OptionKey>('CHOOSE YOUR STATUS');
  
  const [infoText, setInfoText] = useState(
    'INFORMATION ABOUT THE OPTION CHOSEN AFTER THE OPTION IS SELECTED.'
  );

  // CHANGE 4: Type the 'option' parameter as OptionKey instead of string
  const handleSelect = (option: OptionKey) => {
    setSelectedStatus(option);      // Set the new status
    setInfoText(optionInfo[option]); // This will now work correctly
    setIsOpen(false);                 // Close the dropdown
  };

  return (
    // Main container
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-950 to-black p-6 text-white">
      
      <div className="w-full max-w-lg space-y-10">
        
        {/* 1. Title */}
        <h1 className="text-center text-xl font-semibold tracking-widest text-gray-300">
          ENTER YOUR SIGN UP
        </h1>

        {/* 2. Main Form Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-lg font-bold uppercase tracking-wide text-gray-400">
              Sign up as:
            </label>

            {/* Custom Dropdown Menu */}
            <div className="relative w-1/2">
              <button
                onClick={() => setIsOpen(!isOpen)} 
                className="flex w-full items-center justify-between text-left text-lg font-semibold uppercase tracking-wide"
              >
                {selectedStatus}
                <ChevronDownIcon
                  className={`h-6 w-6 text-gray-400 transition-transform ${
                    isOpen ? 'rotate-180' : '' 
                  }`}
                />
              </button>

              {/* Dropdown box */}
              {isOpen && (
                <div className="absolute top-full z-10 mt-2 w-full rounded-md bg-white py-2 text-black shadow-lg">
                  {/* Because 'options' is now typed as OptionKey[],
                    'option' here is automatically inferred as OptionKey,
                    which matches what handleSelect expects.
                  */}
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      className="block w-full px-4 py-2 text-left text-sm uppercase tracking-wider hover:bg-gray-100"
                    >
                      {option}  {/*this is the selected option holding the selected status*/}

            
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Info Text */}
          <p className="pt-4 text-center text-xs uppercase tracking-wide text-gray-500">
            {infoText}
          </p>
        </div>

        {/* 4. Continue Button */}
        <Link
          href="/signup" 
          className="block w-full rounded-lg bg-orange-600 py-3 text-center text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-700"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}