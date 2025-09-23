import { useWallet } from '@/service/wallet/hook';
import { Gem, ShoppingCart } from 'lucide-react';
import React from 'react';

export const TableHeader: React.FC<{ title: string }> = ({ title }) => {
  return <h3 className="text-[#333333] text-xl font-semibold">{title}</h3>;
};

export const RecentActivityTable = () => {
  return (
    <div className="border rounded w-2/5">
      <div className="border-b h-[3rem] flex items-center justify-between px-4">
        <TableHeader title="Recent Activities" />
      </div>
      <div className="px-4 py-5 hover:bg-gray-100 cursor-pointer">{`You don't have any activities logged yet.`}</div>
    </div>
  );
};

export const ListingPackageTable = () => {
  return (
    <div className="border rounded w-2/5">
      <div className="border-b h-[3rem] flex items-center justify-between px-4">
        <TableHeader title="Your Listing Packages" />
      </div>
      <div className="px-4 py-5 hover:bg-gray-100 cursor-pointer flex items-center space-x-4">
        <div className="h-12 w-12 p-2 bg-gray-100 rounded-full flex items-center justify-center">
          <Gem />
        </div>
        <div>
          <TableHeader title="Basic" />
          <p>You have 0 listings posted out of 1, listed for 30 days</p>
        </div>
      </div>
    </div>
  );
};

export const EarningTable = () => {
  const { data: walletData, isLoading } = useWallet();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const lastTenOrders = walletData?.lastTenOrders || [];

  return (
    <div className="border rounded w-full">
      <div className="border-b h-[3rem] flex items-center justify-between px-4">
        <TableHeader title="Last 10 Orders" />
      </div>
      {lastTenOrders.length === 0 ? (
        <div className="px-4 py-5 hover:bg-gray-100 cursor-pointer flex items-center space-x-4">
          <div className="h-12 w-12 p-2 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart />
          </div>
          <div>
            <p>You do not have any orders yet</p>
          </div>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Order ID</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Quantity</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {lastTenOrders.map((order) =>
              order.items.map((item, index) => (
                <tr key={item.id} className="border-b">
                  {index === 0 && (
                    <td
                      className="p-2"
                      rowSpan={order.items.length}
                    >
                      {order.id}
                    </td>
                  )}
                  <td className="p-2">{item.product.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">£{parseFloat(item.price).toFixed(2)}</td>
                  {index === 0 && (
                    <td
                      className="p-2"
                      rowSpan={order.items.length}
                    >
                      £{parseFloat(order.total).toFixed(2)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
