'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { redirect } from 'next/navigation';
import { EventsView } from '../component/customer/EventsView';

export default function EventsPage() {
  const { userRole } = useSelector((state: RootState) => state.auth);

  // Redirect owner or other roles away from customer-only events page
  if (userRole && userRole !== 'customer') {
    redirect('/dashboard');
  }

  return <EventsView />;
}
