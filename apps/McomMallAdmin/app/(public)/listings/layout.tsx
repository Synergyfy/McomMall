import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Listings',
  description: 'Discover and explore local businesses in your area',
};

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-screen min-h-screen bg-gray-50">
      <div className="min-w-full container pt-16">{children}</div>
    </div>
  );
}
