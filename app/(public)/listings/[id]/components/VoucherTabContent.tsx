'use client';

import { useState } from 'react';
import { useGetBusinessVoucherProducts } from '@/service/hooks/useVoucherService';
import { VoucherProduct, Voucher } from '@/service/vouchers/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CURRENCY } from '@/lib/utils';
import VoucherPurchaseModal from './VoucherPurchaseModal';
import VoucherPaymentSuccessModal from '@/components/VoucherPaymentSuccessModal';

interface VoucherTabContentProps {
  businessId: string;
}

export default function VoucherTabContent({
  businessId,
}: VoucherTabContentProps) {
  const {
    voucherProducts,
    isLoading,
    isError,
  } = useGetBusinessVoucherProducts(businessId);
  const router = useRouter();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VoucherProduct | null>(
    null
  );
  const [purchasedVoucher, setPurchasedVoucher] = useState<Voucher | null>(null);

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        <div className="animate-pulse rounded-lg bg-gray-100 p-6">
          <div className="mb-4 h-6 w-3/4 rounded bg-gray-300"></div>
          <div className="mb-2 h-4 w-full rounded bg-gray-300"></div>
          <div className="h-4 w-5/6 rounded bg-gray-300"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-500">
        <h4 className="font-bold">Error</h4>
        <p>Could not load vouchers at this time. Please try again later.</p>
      </div>
    );
  }

  if (!voucherProducts || voucherProducts.length === 0) {
    return (
      <div className="mt-6 rounded-lg bg-gray-50 px-6 py-12 text-center">
        <h4 className="text-lg font-semibold text-gray-700">
          No Vouchers Available
        </h4>
        <p className="mt-2 text-gray-500">
          This business does not have any vouchers available for purchase at the
          moment.
        </p>
      </div>
    );
  }

  const handleBuyNow = (product: VoucherProduct) => {
    setSelectedProduct(product);
    setIsPurchaseModalOpen(true);
  };

  const handleClosePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
    setSelectedProduct(null);
  };

  const handlePurchaseSuccess = (voucher: Voucher) => {
    handleClosePurchaseModal();
    setPurchasedVoucher(voucher);
    setIsSuccessModalOpen(true);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setPurchasedVoucher(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {voucherProducts.map(product => (
          <div
            key={product.id}
            className="transform overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-105"
          >
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
              {product.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {product.description}
                </p>
              )}
              {product.bonusThreshold && product.bonusAmount && (
                <div className="mt-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                        Buy for {CURRENCY}{product.bonusThreshold} and get {CURRENCY}{product.bonusAmount} extra!
                    </span>
                </div>
              )}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700">
                  Pricing Options:
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.fixedAmounts?.map(amount => (
                    <span
                      key={amount}
                      className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-800"
                    >
                      {CURRENCY}
                      {amount}
                    </span>
                  ))}
                  {product.allowCustomAmount && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                      Custom: {CURRENCY}
                      {product.minCustomAmount} - {CURRENCY}
                      {product.maxCustomAmount}
                    </span>
                  )}
                </div>
              </div>
              <Button
                className="mt-6 w-full bg-orange-600 text-white hover:bg-orange-700"
                onClick={() => handleBuyNow(product)}
              >
                Buy Now
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <VoucherPurchaseModal
          product={selectedProduct}
          isOpen={isPurchaseModalOpen}
          onClose={handleClosePurchaseModal}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {purchasedVoucher && (
        <VoucherPaymentSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleCloseSuccessModal}
          voucherCode={purchasedVoucher.code}
          recipientEmail={purchasedVoucher.recipientEmail}
        />
      )}
    </>
  );
}