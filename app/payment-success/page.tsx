import { Suspense } from 'react';
import PaymentSuccessClient from './components/PaymentSuccessClient';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
