// app/dashboard/agent/components/EarningsAndPayouts.tsx
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EarningsAndPayouts: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings & Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Current Balance:</p>
            <p>$500.00</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-semibold">Pending Payouts:</p>
            <p>$200.00</p>
          </div>
          <Button className="w-full">Request Payout</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsAndPayouts;
