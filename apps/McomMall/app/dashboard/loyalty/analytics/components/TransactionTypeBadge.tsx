import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PromotionTransactionHistoryDto } from '@/service/admin/types';

interface TransactionTypeBadgeProps {
  type: PromotionTransactionHistoryDto['type'];
}

const typeColors: Record<PromotionTransactionHistoryDto['type'], string> = {
  EARNED: 'bg-blue-500 hover:bg-blue-600',
  REDEMPTION: 'bg-green-500 hover:bg-green-600',
};

export const TransactionTypeBadge = ({ type }: TransactionTypeBadgeProps) => {
  return (
    <Badge className={cn('text-white', typeColors[type])}>{type}</Badge>
  );
};