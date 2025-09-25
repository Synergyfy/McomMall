import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GiftCardDashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Gift Card Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Manage your gift card templates and view statistics.
      </p>
      <Link
        href="/dashboard/gift-card/templates"
        className={cn(
          buttonVariants({ variant: 'default' }),
          'bg-orange-600 hover:bg-orange-700'
        )}
      >
        Manage Templates
      </Link>
    </div>
  );
};

export default GiftCardDashboardPage;