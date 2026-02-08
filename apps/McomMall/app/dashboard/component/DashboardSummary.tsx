import { BookMarked, ChartNoAxesCombined, Map } from 'lucide-react';

const ListingSummaryCard = () => {
  return (
    <div className="bg-[#E9F8E6] text-[#3fad27] rounded p-4 flex items-center space-x-4 w-[279px] h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">0</p>
        <p className="text-lg">Active Listing</p>
      </div>
      <div className="text-[5rem] font-normal">
        <Map size={80} />
      </div>
    </div>
  );
};

const ViewsSummaryCard = () => {
  return (
    <div className="bg-[#F1F3F9] text-[#464a57] rounded p-4 flex items-center space-x-4 w-[279px] h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">194908</p>
        <p className="text-lg">Total Views</p>
      </div>
      <div className="text-[5rem] font-normal">
        <ChartNoAxesCombined size={80} />
      </div>
    </div>
  );
};
const ReviewSummaryCard = () => {
  return (
    <div className="bg-[#FFF6E3] text-[#e49c0b] rounded p-4 flex items-center space-x-4 w-[279px] h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">0</p>
        <p className="text-lg">Total Reviews</p>
      </div>
      <div className="text-[5rem] font-normal">
        <BookMarked size={80} />
      </div>
    </div>
  );
};
const BookmarkSummaryCard = () => {
  return (
    <div className="bg-[#FFF2F5] text-[#f3103c] rounded p-4 flex items-center space-x-4 w-[279px] h-[160px]">
      <div className="font-medium">
        <p className="text-3xl">194908</p>
        <p className="text-lg">Total Views</p>
      </div>
      <div className="text-[5rem] font-normal">
        <Map size={80} />
      </div>
    </div>
  );
};

export const DashboardSummary = () => {
  return (
    <section>
      <h2 className="text-3xl font-medium">Hello Tom!</h2>
      <div className="flex flex-wrap gap-4 p-6">
        <ListingSummaryCard />
        <ViewsSummaryCard />
        <ReviewSummaryCard />
        <BookmarkSummaryCard />
      </div>
    </section>
  );
};
