'use client';

import React from 'react';
import { Voucher } from '@/service/vouchers/types';
import { QRCode } from 'react-qrcode-logo';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ReloadVoucherModal } from './ReloadVoucherModal';

interface VoucherCardProps {
  voucher: Voucher;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ voucher }) => {
  return (
    <div
      className="w-full aspect-[1.586] rounded-xl shadow-lg p-6 flex flex-col justify-between bg-cover bg-center"
      style={{
        backgroundColor: '#f0f0f0',
        backgroundImage: `url(${voucher.voucherProduct?.backgroundImage})`,
        color: voucher.voucherProduct?.textColor || '#000000',
      }}
    >
      <div className="flex justify-end">
        <div className="bg-white p-1 rounded-md">
          <QRCode value={voucher.code} size={64} />
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="bg-white p-4 rounded-lg text-black">
          <p className="text-lg font-semibold">{voucher.code}</p>
          <p className="text-sm">
            Expires:{' '}
            {voucher.expiresAt
              ? new Date(voucher.expiresAt).toLocaleDateString()
              : 'Never'}
          </p>
          <p className="text-sm">
            {voucher.voucherProduct?.allowReloading
              ? 'Reloadable'
              : 'Not Reloadable'}
          </p>
        </div>
        <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center text-black">
          <p className="text-2xl font-bold">£{Number(voucher.balance).toFixed(2)}</p>
          <p className="text-sm">Balance</p>
        </div>
      </div>
      {voucher.voucherProduct?.allowReloading && (
        <div className="mt-4">
          <ReloadVoucherModal voucher={voucher}>
            <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Reload</span>
            </Button>
          </ReloadVoucherModal>
        </div>
      )}
    </div>
  );
};