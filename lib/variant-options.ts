export const predefinedVariantOptions: Record<string, string[]> = {
  Color: ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Silver', 'Gold'],
  Size: ['Small', 'Medium', 'Large', 'X-Large', 'XX-Large', 'XXL', 'XXXL', '38', '39', '40', '41', '42'],
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
  Standard: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  UK: ['34', '36', '38', '40', '42', '44'],
};

export const sizeMapping: Record<string, string> = {
  'XS': '34',
  'S': '36',
  'M': '38',
  'L': '40',
  'XL': '42',
  'XXL': '44',
  '34': 'XS',
  '36': 'S',
  '38': 'M',
  '40': 'L',
  '42': 'XL',
  '44': 'XXL',
};
