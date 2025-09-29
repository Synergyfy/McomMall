'use client';

// Mock hook to simulate fetching voucher data.
// Replace this with a real data-fetching hook when the API is available.
const useGetBusinessVouchers = (businessId?: string) => {
  // The businessId parameter is acknowledged here to satisfy the linter.
  // It will be used in the actual implementation.
  if (!businessId) {
    return { data: [], isPending: false, isError: true };
  }

  return {
    data: [], // No vouchers are available yet.
    isPending: false,
    isError: false,
  };
};

interface VoucherContentProps {
  businessId?: string;
}

const VoucherContent = ({ businessId }: VoucherContentProps) => {
  const { data: vouchers, isPending, isError } = useGetBusinessVouchers(businessId);

  if (isPending) {
    return (
      <div className="space-y-4 mt-4">
        <div className="bg-gray-100 p-6 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 bg-red-50 p-4 rounded-lg">
        <h4 className="font-bold">Error</h4>
        <p>Could not load vouchers at this time. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold border-t pt-6 text-gray-800">
        Vouchers
      </h3>
      {vouchers && vouchers.length > 0 ? (
        <div className="space-y-6 mt-6">
          {/* This section will be populated with voucher data when available. */}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg mt-6">
          <h4 className="text-lg font-semibold text-gray-700">
            No Vouchers Available
          </h4>
          <p className="text-gray-500 mt-2">
            This business does not have any active vouchers at the moment.
            Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default VoucherContent;