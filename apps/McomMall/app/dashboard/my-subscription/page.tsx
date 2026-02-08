import { Suspense } from 'react';
import MySubscriptionPageClient from './components/MySubscriptionPageClient';

export default function MySubscriptionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MySubscriptionPageClient />
    </Suspense>
  );
}
