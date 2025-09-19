'use client';

import React from 'react';
import ListingsStatusPage from '../components/ListingsStatusPage';

const ActiveListingsPage: React.FC = () => {
  return (
    <ListingsStatusPage
      title="Active Listings"
      description="This is where you can manage your active listings. We are currently working on this feature."
    />
  );
};

export default ActiveListingsPage;
