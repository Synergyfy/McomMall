// app/dashboard/agent/page.tsx
import { FC } from 'react';
import TopHeader from './components/TopHeader';
import GreetingAndStatus from './components/GreetingAndStatus';
import AvailableTasks from './components/AvailableTasks';
import ActiveTasks from './components/ActiveTasks';
import CompletedTasks from './components/CompletedTasks';
import EarningsAndPayouts from './components/EarningsAndPayouts';
import Training from './components/Training';
import SupportAndDisputes from './components/SupportAndDisputes';

const AgentDashboardPage: FC = () => {
  return (
    <div className="space-y-8">
      <TopHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <GreetingAndStatus />
          <Training />
          <SupportAndDisputes />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <AvailableTasks />
          <ActiveTasks />
          <CompletedTasks />
          <EarningsAndPayouts />
        </div>
      </div>
    </div>
  );
};

export default AgentDashboardPage;
