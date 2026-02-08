import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Listings',
  description: 'Discover and explore local businesses in your area',
};


export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="w-full max-w-[100%] mx-auto">
        {children}
      </div>
    </div>
  );
}
