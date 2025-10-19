'use client';

import * as React from 'react';
import { GiftCardDesign } from '../types';

interface EmailPreviewProps {
  design: GiftCardDesign;
  amount: string;
  recipientName: string;
  fromName: string;
  message: string;
}

export function EmailPreview({
  design,
  amount,
  recipientName,
  fromName,
  message,
}: EmailPreviewProps) {
  // Calculate an expiry date one year from today
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-100 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Email Preview</h3>
        <p className="text-sm text-gray-500">
          This is what {recipientName} will see.
        </p>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {" You've received a Gift Card!"}
            </h2>
            <p className="text-gray-600">From: {fromName}</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-700 italic">&quot;{message}&quot;</p>
            </div>
          )}

          <div
            className="rounded-lg p-6 text-white text-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`,
            }}
          >
            <div className="flex justify-center mb-4 opacity-80">
              <design.icon className="h-12 w-12" />
            </div>
            <p className="text-lg font-semibold">{design.name}</p>
            <p className="text-4xl font-bold tracking-tight my-2">
              ${amount || '0.00'}
            </p>
            <p className="text-sm font-mono opacity-70 tracking-widest">
              1234-WXYZ-5678-ABCD
            </p>
            <button className="mt-6 bg-white/90 hover:bg-white text-gray-800 font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
              Redeem Now
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            Expires: {expiryDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
