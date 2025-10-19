import { Medal } from 'lucide-react';
import React from 'react';
import { CURRENCY } from '@/lib/utils';

const DashboardHeader = () => {
  return (
    <header className="w-full text-gray-700 bg-white py-5">
      <ul className="flex items-center justify-center gap-10">
        <li className="flex flex-col gap-1 items-center justify-center">
          <p className="font-bold text-3xl">3</p>
          <p className="text-sm font-medium">Members</p>
        </li>
        <li className="flex flex-col gap-1 items-center justify-center">
          <p className="font-bold text-3xl">23</p>
          <p className="text-sm font-medium">Total Customers</p>
        </li>
        <li className="flex flex-col gap-1 items-center justify-center">
          <p className="font-bold text-3xl">13%</p>
          <p className="text-sm font-medium">Enrolled Percentage</p>
        </li>
        <li className="flex flex-col gap-1 items-center justify-center">
          <p className="font-bold text-3xl">{CURRENCY}2,933</p>
          <p className="text-sm font-medium">Member revenue</p>
        </li>
      </ul>
    </header>
  );
};

const MostPopularOffer: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => {
  return (
    <div className="w-full md:w-3/5 flex items-center gap-5 border border-black rounded-sm bg-white py-3 px-6">
      <span>
        <Medal className="text-3xl" size={40} />
      </span>
      <div>
        <p className="text-2xl font-bold">{title}</p>
        <p className="font-medium text-lg text-gray-700">{description}</p>
      </div>
    </div>
  );
};

const MostPopularOfferContainer = () => {
  return (
    <section className="mt-7">
      <h5 className="text-gray-700 font-medium">Most popular offer</h5>
      <div className="space-y-4">
        <MostPopularOffer
          title={`Save ${CURRENCY}5`}
          description="On your total purchase"
        />
        <MostPopularOffer
          title={`Save ${CURRENCY}25`}
          description="On your total purchase"
        />
      </div>
    </section>
  );
};

const LoyaltyPage = () => {
  return (
    <div>
      <DashboardHeader />
      <MostPopularOfferContainer />
    </div>
  );
};

export default LoyaltyPage;
