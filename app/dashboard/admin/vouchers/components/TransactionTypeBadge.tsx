import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VoucherTransactionHistoryDto } from '@/service/admin/types';

interface TransactionTypeBadgeProps {
  type: VoucherTransactionHistoryDto['type'];
}

const typeColors: Record<VoucherTransactionHistoryDto['type'], string> = {
  PURCHASE: 'bg-blue-500 hover:bg-blue-600',
  REDEMPTION: 'bg-green-500 hover:bg-green-600',
  REVERSAL: 'bg-yellow-500 hover:bg-yellow-600',
  REFUND: 'bg-red-500 hover:bg-red-600',
};

export const TransactionTypeBadge = ({ type }: TransactionTypeBadgeProps) => {
  return (
    <Badge className={cn('text-white', typeColors[type])}>{type}</Badge>
  );
};