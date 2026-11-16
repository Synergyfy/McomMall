'use client';

import React from 'react';

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-6 w-full min-h-screen pb-12">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-[#0b1c30]">
          Subscription
        </h1>
        <p className="text-sm text-gray-500">
          View your current plan, compare options, and manage your membership.
        </p>
      </div>

      <div className="flex-grow w-full min-w-0">{children}</div>
    </div>
  );
}
