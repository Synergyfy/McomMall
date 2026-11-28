import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TakeadsDisclosureProps {
  className?: string;
  compact?: boolean;
}

export default function TakeadsDisclosure({
  className,
  compact = false,
}: TakeadsDisclosureProps) {
  return (
    <p
      className={cn(
        'flex items-start justify-center gap-1 text-center text-[10px] leading-relaxed text-gray-400',
        compact ? 'mt-2' : 'mt-4 text-xs',
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
      <span>
        {compact
          ? 'You complete this purchase on the merchant\u2019s site. MCOM Mall may earn a commission.'
          : 'MCOM Mall may earn a commission if you make a qualifying purchase through this link. Your purchase is completed with the external merchant and is subject to that merchant\u2019s terms.'}
      </span>
    </p>
  );
}
