'use client';

import React from 'react';
import { useWatch, Control } from 'react-hook-form';
import { CreateVoucherProductDto } from '@/service/vouchers/types';
import { QRCode } from 'react-qrcode-logo';
import { ShieldCheck, Tag } from 'lucide-react';

interface VoucherCardPreviewProps {
  control: Control<CreateVoucherProductDto>;
}

const VerticalRedRibbon = () => (
  <div className="absolute top-0 left-[25%] bottom-0 w-3 z-20 pointer-events-none">
    <div className="w-full h-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 shadow-[2px_0_10px_rgba(0,0,0,0.3)]" />
  </div>
);

const RedBow = () => (
  <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 z-30 scale-75 pointer-events-none">
    <div className="relative w-24 h-16 flex items-center justify-center">
      <div className="absolute -left-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-br from-red-500 to-red-900 rotate-[-15deg] shadow-lg" />
      <div className="absolute -right-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-bl from-red-500 to-red-900 rotate-[15deg] shadow-lg" />
      <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-500 z-10 shadow-xl" />
      <div className="absolute top-8 -left-3 w-8 h-10 bg-red-700 rounded-bl-3xl rotate-[-20deg] opacity-90" />
      <div className="absolute top-8 -right-3 w-8 h-10 bg-red-700 rounded-br-3xl rotate-[20deg] opacity-90" />
    </div>
  </div>
);

const VoucherWatermark = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
    <span className="text-[10rem] font-black uppercase rotate-[-15deg] select-none translate-x-12 translate-y-8">Gift</span>
  </div>
);

export const VoucherCardPreview: React.FC<VoucherCardPreviewProps> = ({
  control,
}) => {
  const [
    name,
    textColor,
    backgroundImage,
    expiryDays,
    allowReloading,
  ] = useWatch({
    control,
    name: ['name', 'textColor', 'backgroundImage', 'expiryDays', 'allowReloading'],
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (backgroundImage && backgroundImage.length > 0) {
      if (backgroundImage[0] instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(backgroundImage[0]);
      } else if (typeof backgroundImage === 'string') {
        setImagePreview(backgroundImage);
      }
    } else {
      setImagePreview(null);
    }
  }, [backgroundImage]);

  return (
    <div className="w-full aspect-[1.586] rounded-[2rem] shadow-2xl flex relative overflow-hidden bg-white group">
      {/* Left Section (Dark) */}
      <div className="w-[25%] bg-neutral-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-50" />

        <div className="relative z-40 bg-red-600 w-16 h-16 rounded-full border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl mb-8 translate-x-4">
          <span className="text-white text-xs font-black leading-none drop-shadow">Value</span>
        </div>

        <div className="mt-auto relative z-40 translate-x-4">
          <ShieldCheck className="text-white/20" size={20} />
        </div>
      </div>

      {/* Right Section (Light) */}
      <div className="flex-1 bg-white relative p-6 flex flex-col overflow-hidden">
        <VoucherWatermark />
        <VerticalRedRibbon />
        <RedBow />

        {imagePreview && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
            style={{ backgroundImage: `url(${imagePreview})` }}
          />
        )}

        <div className="relative z-10 flex justify-between items-start mb-2">
          <div className="pl-4">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-3 h-3 rounded bg-red-600 flex items-center justify-center">
                <div className="w-1 h-1 bg-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">
                YOUR COMPANY NAME
              </span>
            </div>
            <p className="text-[7px] text-gray-400 font-bold tracking-widest pl-5 uppercase">Digital Marketing</p>
          </div>
          <div className="bg-white p-1 rounded-md shadow-sm border border-gray-100 scale-75 origin-top-right">
            <QRCode value="DUMMY-CODE" size={48} />
          </div>
        </div>

        <div className="relative z-10 pl-4 mt-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1">VOUCHER</h2>
          <p className="text-[12px] font-black text-red-600 mb-2 uppercase tracking-tight">{name || 'Voucher Name'}</p>
          <div className="space-y-0.5">
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">
              Expires: {expiryDays ? `${expiryDays} days` : 'Never'}
            </p>
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">
              {allowReloading ? 'Reloadable' : 'Fixed Balance'}
            </p>
          </div>
        </div>

        <div className="relative z-10 pl-4 mt-auto flex items-center justify-between pointer-events-none">
          <div className="px-4 py-1.5 border border-gray-900 rounded-full">
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-900">YOUR COMPANY NAME</span>
          </div>
          <div className="p-2 rounded-xl bg-gray-50 text-gray-300">
            <Tag size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
