import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEnumValue(value: string) {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export {
  CURRENCY,
  formatMoney,
  formatPence,
  fromPence,
  parseMoneyInput,
  toPence,
} from './money';

import { formatMoney } from './money';

export function formatCurrency(amount: number) {
  return formatMoney(amount);
}
