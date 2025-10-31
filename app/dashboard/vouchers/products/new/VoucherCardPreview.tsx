'use client';

import React from 'react';
import { useWatch } from 'react-hook-form';
import { Control } from 'react-hook-form';
import { CreateVoucherProductDto } from '@/service/vouchers/types';
import { QRCode } from 'react-qrcode-logo';

interface VoucherCardPreviewProps {
  control: Control<CreateVoucherProductDto>;
}

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(backgroundImage[0]);
    } else {
      setImagePreview(null);
    }
  }, [backgroundImage]);

  return (
    <div
      className="w-full aspect-[1.586] rounded-xl shadow-lg p-6 flex flex-col justify-between bg-cover bg-center"
      style={{
        backgroundColor: '#f0f0f0',
        backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
        color: textColor || '#000000',
      }}
    >
      <div className="flex justify-end">
        <div className="bg-white p-1 rounded-md">
            <QRCode value={name || 'sample-code'} size={64} />
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-lg font-semibold">{name || 'COUPON CODE'}</p>
          <p className="text-sm">
            Expires:{' '}
            {expiryDays ? `${expiryDays} days after purchase` : 'Never'}
          </p>
          <p className="text-sm">
            {allowReloading ? 'Reloadable' : 'Not Reloadable'}
          </p>
        </div>
        <div className="text-center">
            <p className="text-2xl font-bold">£50.00</p>
            <p className="text-sm">Balance</p>
        </div>
      </div>
    </div>
  );
};