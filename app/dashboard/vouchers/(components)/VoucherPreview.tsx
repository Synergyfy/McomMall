'use client';

import React from 'react';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { CreateVoucherProductDto } from '@/service/vouchers/types';
import { CURRENCY } from '@/lib/utils';

interface VoucherPreviewProps {
  product: Partial<CreateVoucherProductDto>;
  backgroundImageUrl?: string | null;
}

export const VoucherPreview: React.FC<VoucherPreviewProps> = ({
  product,
  backgroundImageUrl,
}) => {
  const voucherCode = 'VOUCHER-CODE-123';
  const redeemUrl = `https://your-app.com/redeem?code=${voucherCode}`;

  const renderPrice = () => {
    if (product.allowCustomAmount) {
      return `${CURRENCY}${product.minCustomAmount || '0'} - ${CURRENCY}${
        product.maxCustomAmount || '0'
      }`;
    }
    if (product.fixedAmounts && product.fixedAmounts.length > 0) {
      return `${CURRENCY}${product.fixedAmounts[0]}`;
    }
    return `${CURRENCY}50`; // Default placeholder
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-white shadow-lg">
      <div className="relative h-48 w-full">
        {backgroundImageUrl ? (
          <Image
            src={backgroundImageUrl}
            alt={product.name || 'Voucher background'}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200">
            <span className="text-gray-500">Voucher Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {product.name || 'Voucher Name'}
            </h3>
            <p className="text-sm text-gray-600">
              {product.description || 'Voucher description goes here.'}
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white">
            <span className="text-lg font-bold">{renderPrice()}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500">Voucher Code</p>
              <p className="font-mono text-lg font-bold text-gray-800">
                {voucherCode}
              </p>
            </div>
            <div className="flex-grow text-center">
              <Barcode
                value={voucherCode}
                width={1.5}
                height={40}
                displayValue={false}
              />
            </div>
            <div className="rounded-md bg-white p-1">
              <QRCode value={redeemUrl} size={64} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};