export const predefinedVariantOptions: Record<string, string[]> = {
  Color: ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Silver', 'Gold'],
  Size: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'],
  Storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  Model: ['Pro', 'Standard', 'Max', 'Mini'],
  Material: ['Cotton', 'Polyester', 'Leather', 'Wool', 'Silk'],
  Voltage: ['110V', '220V', 'Dual Voltage'],
  RAM: ['4GB', '8GB', '16GB', '32GB', '64GB'],
  Processor: ['i3', 'i5', 'i7', 'i9', 'M1', 'M2', 'M3', 'Ryzen 5', 'Ryzen 7'],
  'Plug Type': ['UK', 'EU', 'US', 'AU'],
  Capacity: ['1L', '2L', '5L', '10L', '20L', '50L'],
};

export const sizeSystems = {
  Standard: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'],
  UK: ['32', '34', '36', '38', '40', '42', '44', '46', '48', '50'],
};

export const sizeMapping: Record<string, string> = {
  'XXS': '32',
  'XS': '34',
  'S': '36',
  'M': '38',
  'L': '40',
  'XL': '42',
  'XXL': '44',
  '3XL': '46',
  '4XL': '48',
  '5XL': '50',
  '32': 'XXS',
  '34': 'XS',
  '36': 'S',
  '38': 'M',
  '40': 'L',
  '42': 'XL',
  '44': 'XXL',
  '46': '3XL',
  '48': '4XL',
  '50': '5XL',
};
