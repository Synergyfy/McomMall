
export default function EarningsTab() {
  return (
    <>
      {/* E. Earnings and Payouts */}
      <div id="earnings" className="rounded-lg border p-8">
        <h2 className="text-3xl font-semibold">Earnings & Payouts</h2>
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="border p-6 rounded-md">
            <h3 className="text-2xl font-semibold">Pending Balance</h3>
            <p className="text-4xl font-bold mt-4">$125.00</p>
          </div>
          <div className="border p-6 rounded-md">
            <h3 className="text-2xl font-semibold">Last Payout</h3>
            <p className="text-4xl font-bold mt-4">$500.00</p>
            <p className="text-muted-foreground text-lg">on 2024-10-25</p>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button className="bg-primary text-white px-8 py-4 rounded-md text-xl">Request Payout</button>
        </div>
      </div>
    </>
  );
}
