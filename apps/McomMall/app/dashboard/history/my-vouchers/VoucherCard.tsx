"use client";

import React from "react";
import { Voucher } from "@/service/vouchers/types";
import { QRCode } from "react-qrcode-logo";
import { Button } from "@/components/ui/button";
import { PlusCircle, Share2, Check } from "lucide-react";
import { ReloadVoucherModal } from "./ReloadVoucherModal";
import { useShareLink } from "@/lib/hooks/useShareLink";

interface VoucherCardProps {
  voucher: Voucher;
}

const VerticalRedRibbon = () => (
  <div className="absolute top-0 left-[-5%] bottom-0 w-3 z-20 pointer-events-none">
    <div className="w-full h-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 shadow-[2px_0_10px_rgba(0,0,0,0.3)]" />
  </div>
);

const RedBow = () => (
  <div className="absolute top-1/2 left-[-5%] -translate-x-1/2 -translate-y-1/2 z-30 scale-50 sm:scale-[0.6] pointer-events-none">
    <div className="relative w-24 h-16 flex items-center justify-center">
      <div className="absolute -left-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-br from-red-500 to-red-900 rotate-[-15deg] shadow-lg" />
      <div className="absolute -right-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-bl from-red-500 to-red-900 rotate-[15deg] shadow-lg" />
      <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-500 z-10 shadow-xl" />
    </div>
  </div>
);

const VoucherWatermark = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
    <span className="text-[10rem] font-black uppercase rotate-[-15deg] select-none translate-x-8 translate-y-4">Mcom</span>
  </div>
);

export const VoucherCard: React.FC<VoucherCardProps> = ({ voucher }) => {
  const { copiedLink, handleShare } = useShareLink();
  const textColor = voucher.voucherProduct?.textColor || "#000000";
  const bgImage = voucher.voucherProduct?.backgroundImage;

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative aspect-[1.586] bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 flex">
        {/* Left Section (Dark) */}
        <div className="w-[25%] bg-neutral-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-50" />

          {/* Circular Balance Badge */}
          <div className="relative z-40 bg-red-600 w-16 h-16 rounded-full border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl mb-8 translate-x-4">
            <span className="text-white text-[10px] font-black leading-none drop-shadow">£{Number(voucher.balance).toFixed(2)}</span>
            <span className="text-white text-[6px] font-bold uppercase tracking-widest mt-0.5">Balance</span>
          </div>
        </div>

        {/* Right Section (Light) */}
        <div className="flex-1 bg-white relative p-6 flex flex-col overflow-hidden">
          <VoucherWatermark />
          <VerticalRedRibbon />
          <RedBow />

          {bgImage && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
          )}

          <div className="relative z-10 flex justify-between items-start mb-2">
            <div className="pl-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded bg-red-600" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">
                  MCOM MALL OFFICIAL
                </span>
              </div>
            </div>
            <div className="bg-white p-1 rounded-md shadow-sm border border-gray-100 scale-75 origin-top-right">
              <QRCode value={voucher.code} size={48} />
            </div>
          </div>

          <div className="relative z-10 pl-6 mt-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1">VOUCHER</h2>
            <code className="text-[12px] font-black text-red-600 mb-2 uppercase tracking-tight block">{voucher.code}</code>
            <div className="space-y-0.5 mt-2">
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                Expires: {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : "Never"}
              </p>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                {voucher.voucherProduct?.allowReloading ? 'Reloadable' : 'Fixed Balance'}
              </p>
            </div>
          </div>

          <div className="relative z-10 pl-6 mt-auto flex items-center justify-between pointer-events-none">
            <div className="px-4 py-1.5 border border-gray-900 rounded-full">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-900">PURCHASED HISTORY</span>
            </div>
            <div className="text-right">
              <p className="text-[7px] font-black uppercase text-gray-400 tracking-[0.2em] mb-0.5">Current Balance</p>
              <p className="text-lg font-black text-gray-900 leading-none">£{Number(voucher.balance).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {voucher.voucherProduct?.allowReloading && (
        <div className="flex items-center gap-2">
          <ReloadVoucherModal voucher={voucher}>
            <Button
              variant="outline"
              size="sm"
              className="flex-grow flex items-center justify-center gap-1 rounded-xl h-10 border-gray-200 hover:border-red-500 hover:text-red-600 font-bold"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Reload</span>
            </Button>
          </ReloadVoucherModal>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("voucher", voucher.id)}
            className="p-2 flex-shrink-0 rounded-xl h-10 w-10 border-gray-200 hover:border-red-500 hover:text-red-600"
          >
            {copiedLink === voucher.id ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
