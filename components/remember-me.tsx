'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function RememberMe() {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="remember" />
      <Label htmlFor="remember">Remember Me</Label>
    </div>
  );
}
