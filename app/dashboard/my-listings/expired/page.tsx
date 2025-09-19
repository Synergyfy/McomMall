'use client';

import React from 'react';
import ListingsStatusPage from '../components/ListingsStatusPage';

const ExpiredListingsPage: React.FC = () => {
  return (
    <ListingsStatusPage
      title="Expired Listings"
      description="This is where you can manage your expired listings. We are currently working on this feature."
    />
  );
};

export default ExpiredListingsPage;
