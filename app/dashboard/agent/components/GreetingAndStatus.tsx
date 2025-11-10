// app/dashboard/agent/components/GreetingAndStatus.tsx
import { FC } from 'react';
import { Progress } from '@/components/ui/progress';

const GreetingAndStatus: FC = () => {
  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold">Welcome, Agent!</h2>
      <p className="text-gray-500">
        Here's your progress. Keep up the great work!
      </p>
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">Certification Score</p>
          <p className="text-sm font-semibold">85%</p>
        </div>
        <Progress value={85} className="mt-2" />
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">
            Progress to Account Manager
          </p>
          <p className="text-sm font-semibold">60%</p>
        </div>
        <Progress value={60} className="mt-2" />
      </div>
    </div>
  );
};

export default GreetingAndStatus;
