'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function TermsCondtion({
  isChecked,
  onChange,
}: {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Checkbox id="terms-2" checked={isChecked} onCheckedChange={onChange} />
        <div className="grid gap-2">
          <Label htmlFor="terms-2">Accept terms and conditions</Label>
        </div>
      </div>
    </div>
  );
}
