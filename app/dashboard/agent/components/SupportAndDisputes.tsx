// app/dashboard/agent/components/SupportAndDisputes.tsx
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupportAndDisputes: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support & Disputes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            If you have any issues with a client or a task, please contact our
            support team.
          </p>
          <Button className="w-full">Message Support</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportAndDisputes;
