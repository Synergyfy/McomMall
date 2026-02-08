import { LucideIcon } from 'lucide-react';

export interface AdFormData {
  listing: string;
  campaignType: 'ppv' | 'ppc';
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: number | string;
  category: string;
  region: string;
  ukLocation?: string;
  locationSearch: string;
  forLoggedInUsers: boolean;
  placements: string[];
}

export type FormErrors = Partial<Record<keyof AdFormData, string>>;

export interface SearchableSelectItem {
  value: string;
  label: string;
}

export interface AdPlacement {
  id: string;
  title: string;
  price: number;
  icon: LucideIcon;
}
