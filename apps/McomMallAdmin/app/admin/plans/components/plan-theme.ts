import { Crown, Rocket, Zap, type LucideIcon } from 'lucide-react';
import { PlanTier } from '@/app/admin/types/plan';

export interface TierTheme {
  icon: LucideIcon;
  /** Gradient for banners / highlights (full Tailwind literals). */
  banner: string;
  /** Soft tinted background for tiles and price blocks. */
  soft: string;
  /** Accent text color. */
  text: string;
  /** Accent border color. */
  border: string;
  /** Solid dot / tile background. */
  solid: string;
  /** Badge chip classes. */
  chip: string;
}

export const TIER_THEME: Record<PlanTier, TierTheme> = {
  [PlanTier.STANDARD]: {
    icon: Zap,
    banner: 'from-sky-500 to-blue-600',
    soft: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    solid: 'bg-sky-500',
    chip: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  [PlanTier.PRO]: {
    icon: Rocket,
    banner: 'from-violet-500 to-purple-600',
    soft: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    solid: 'bg-violet-500',
    chip: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  [PlanTier.PRO_PLUS]: {
    icon: Crown,
    banner: 'from-amber-400 to-orange-500',
    soft: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    solid: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};
