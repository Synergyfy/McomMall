'use client';

import React from 'react';
import QRCode from 'react-qr-code';

interface VoucherPreviewProps {
  name?: string;
  fixedAmounts?: number[];
  customAmountMin?: number;
  customAmountMax?: number;
  backgroundImage?: string;
  textColor?: string;
  expiryDays?: number;
}

export const VoucherPreview: React.FC<VoucherPreviewProps> = ({
  name = 'Voucher Product Name',
  fixedAmounts = [10, 20, 50],
  customAmountMin,
  customAmountMax,
  backgroundImage,
  textColor = '#000000',
  expiryDays,
}) => {
  const voucherCode = 'PREVIEW-CODE-123';

  const getAmountText = () => {
    if (fixedAmounts.length > 0) {
      return `Value: ${fixedAmounts
        .map(amount => `£${amount}`)
        .join(', ')}`;
    }
    if (customAmountMin && customAmountMax) {
      return `Value: £${customAmountMin} - £${customAmountMax}`;
    }
    return 'Value: N/A';
  };

  return (
    <div
      className="relative flex h-[200px] w-full flex-col justify-between overflow-hidden rounded-xl bg-cover bg-center p-4 text-white shadow-lg"
      style={{
        backgroundImage: `url(${backgroundImage || '/placeholder.jpg'})`,
        color: textColor,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-xs opacity-90">{getAmountText()}</p>
          {expiryDays && (
            <p className="mt-1 text-xs opacity-80">
              Expires in {expiryDays} days
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white p-1">
          <QRCode value={voucherCode} size={48} />
        </div>
      </div>

      <div className="relative z-10 text-right">
        <p className="text-xs font-mono tracking-wider">{voucherCode}</p>
        <p className="text-xs opacity-80">Scan QR or enter code at checkout</p>
      </div>
    </div>
  );
};