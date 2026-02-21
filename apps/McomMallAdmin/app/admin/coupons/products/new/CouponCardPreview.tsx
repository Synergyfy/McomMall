'use client';

import React from 'react';
import { UseFormWatch } from 'react-hook-form';
import { CreateCouponProductDto } from '@/service/coupon-products/types';
import { formatCurrency } from '@/lib/utils';

interface CouponCardPreviewProps {
  watch: UseFormWatch<CreateCouponProductDto>;
}

export const CouponCardPreview: React.FC<CouponCardPreviewProps> = ({ watch }) => {
  const { name, description, textColor, backgroundImage, fixedAmounts, logoUrl } = watch();

  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [bgPreview, setBgPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    const logoField = logoUrl as any;
    if (logoField && logoField.length > 0) {
      if (logoField[0] instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(logoField[0]);
      } else if (typeof logoUrl === 'string') {
        setLogoPreview(logoUrl);
      }
    } else {
      setLogoPreview(null);
    }
  }, [logoUrl]);

  React.useEffect(() => {
    const bgField = backgroundImage as any;
    if (bgField && bgField.length > 0) {
      if (bgField[0] instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => setBgPreview(reader.result as string);
        reader.readAsDataURL(bgField[0]);
      } else if (typeof backgroundImage === 'string') {
        setBgPreview(backgroundImage);
      }
    } else {
      setBgPreview(null);
    }
  }, [backgroundImage]);

  const cardStyle = {
    backgroundColor: bgPreview ? 'transparent' : '#f0f0f0',
    backgroundImage: bgPreview ? `url(${bgPreview})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: textColor || '#000',
  };

  return (
    <div className="rounded-lg shadow-md p-6" style={cardStyle}>
      <div className="text-center">
        <h3 className="text-xl font-bold">{name || 'Your Coupon Name'}</h3>
        <p className="text-sm">{description || 'A short description of the coupon.'}</p>
        {logoPreview && (
          <div className="flex justify-center mt-2 h-12">
            <img src={logoPreview} alt="Logo" className="h-full object-contain" />
          </div>
        )}
        <div className="text-4xl font-bold my-4">
          {fixedAmounts && fixedAmounts.length > 0 ? formatCurrency(fixedAmounts[0]) : '£25.00'}
        </div>
      </div>
    </div>
  );
};
