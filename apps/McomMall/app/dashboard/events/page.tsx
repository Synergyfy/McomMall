'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { EventsView } from '../component/customer/EventsView';
import { EventsManager } from './components/events-manager';

export default function EventsPage() {
  const { userRole } = useSelector((state: RootState) => state.auth);

  if (userRole === 'customer' || userRole === 'CUSTOMER') {
    return <EventsView />;
  }

  return <EventsManager />;
}
