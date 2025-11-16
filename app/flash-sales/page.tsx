import type { Metadata } from 'next';
import FlashSalesClient from './components/FlashSalesClient';

export const metadata: Metadata = {
  title: 'Flash Sales',
};

export default function FlashSalesPage() {
  return <FlashSalesClient />;
}
