'use client';

import React from 'react';
import ListingsStatusPage from '../components/ListingsStatusPage';

const PendingListingsPage: React.FC = () => {
  return (
    <ListingsStatusPage
      title="Pending Listings"
      description="This is where you can manage your pending listings. We are currently working on this feature."
    />
  );
};

export default PendingListingsPage;
