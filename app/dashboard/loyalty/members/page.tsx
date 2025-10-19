import { MembersTable } from './components/members-table';
import { RewardsAndTransactions } from './components/rewards-and-transactions';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Customer Rewards Program
        </h1>
        <MembersTable />
        <RewardsAndTransactions />
      </div>
    </main>
  );
}
