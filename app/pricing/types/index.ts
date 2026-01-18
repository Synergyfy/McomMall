export interface PricingTier {
  name: string;
  price: string;
  inherits?: string;
  primaryFeatures: string[];
  secondaryFeatures?: string[];
  accent?: 'teal' | 'purple' | 'yellow';
  colorCode?: string; // Hex color from API
}

export interface TableFeature {
  name: string;
  availability: boolean[];
  tooltip?: string;
}

export interface FeatureGroup {
  name: string;
  features: TableFeature[];
}
