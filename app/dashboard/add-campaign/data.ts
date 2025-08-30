import { SearchableSelectItem, AdPlacement } from './types';
import { LayoutDashboard, List, Sidebar } from 'lucide-react';

export const mockListings: SearchableSelectItem[] = [
  { value: 'listing-1', label: 'Modern Downtown Loft' },
  { value: 'listing-2', label: 'Suburban Family Home' },
  { value: 'listing-3', label: 'Cozy Beachside Cottage' },
  { value: 'listing-4', label: 'Luxury Penthouse with View' },
];

export const mockRegions: SearchableSelectItem[] = [
  { value: 'reg-1', label: 'Zurich' },
  { value: 'reg-2', label: 'Geneva' },
  { value: 'reg-3', label: 'Bern' },
  { value: 'reg-4', label: 'Basel' },
];

export const adPlacements: AdPlacement[] = [
  { id: 'homepage', title: 'Homepage', price: 0.1, icon: LayoutDashboard },
  { id: 'search_top', title: 'Top Of Search Results', price: 0.12, icon: List },
  { id: 'sidebar', title: 'Sidebar', price: 0.11, icon: Sidebar },
];
