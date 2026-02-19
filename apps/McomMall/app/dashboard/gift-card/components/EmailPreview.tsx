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

const GoldenRibbon = () => (
  <div className="absolute bottom-[20%] left-0 w-full h-3 z-10">
    <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-md" />
  </div>
);

const GoldenBow = () => (
  <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-6px)] z-20 scale-75">
    <div className="relative w-16 h-10 flex items-center justify-center">
      <div className="absolute -left-1 w-8 h-8 border-[3px] border-yellow-500 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 rotate-[-15deg] shadow-sm" />
      <div className="absolute -right-1 w-8 h-8 border-[3px] border-yellow-500 rounded-full bg-gradient-to-bl from-amber-400 to-yellow-600 rotate-[15deg] shadow-sm" />
      <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 z-10 shadow-md" />
    </div>
  </div>
);

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
    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
      <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          Email Preview
        </h3>
        <p className="text-sm text-gray-500 font-medium">
          This is what {recipientName} will see in their inbox.
        </p>
      </div>
      <div className="p-8 bg-gray-50/50">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {"You've received a Gift Card!"}
            </h2>
            <div className="h-1 w-12 bg-yellow-500 mx-auto rounded-full mb-4" />
            <p className="text-gray-600 font-medium">From: <span className="text-gray-900 font-bold">{fromName}</span></p>
          </div>

          {message && (
            <div className="mb-8 p-6 bg-yellow-50/50 rounded-2xl border border-yellow-200/50 relative">
              <span className="absolute -top-3 left-6 px-2 bg-white text-yellow-600 text-xs font-bold uppercase tracking-widest">Personal Message</span>
              <p className="text-gray-700 italic leading-relaxed">&quot;{message}&quot;</p>
            </div>
          )}

          <div
            className="rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border-4 border-white/10"
            style={{
              background: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`,
            }}
          >
            <GoldenRibbon />
            <GoldenBow />

            <div className="relative z-30 h-full flex flex-col items-center">
              <div className="flex flex-col items-center mb-6">
                <h4 className="text-4xl font-black text-yellow-500 italic tracking-tighter leading-none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  GIFT <span className="text-yellow-400">CARD</span>
                </h4>
                <div className="flex items-center gap-2 mt-2 opacity-60">
                  <design.icon className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">{design.name}</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-5xl font-black tracking-tighter text-yellow-400 drop-shadow-lg scale-110">
                  £{amount || '0.00'}
                </p>
              </div>

              <div className="flex flex-col items-center mb-24">
                <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mb-1">Redemption Code</p>
                <p className="text-lg font-mono tracking-widest text-yellow-500 drop-shadow">
                  1234-WXYZ-5678-ABCD
                </p>
              </div>

              <button className="relative z-40 bg-white text-gray-900 font-black py-4 px-10 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 group overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Redeem Now
                </span>
                <div className="absolute inset-0 bg-yellow-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-400 font-bold text-center mt-6 uppercase tracking-widest">
            Expires: {expiryDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
