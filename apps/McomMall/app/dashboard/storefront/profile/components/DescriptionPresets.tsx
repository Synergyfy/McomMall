export interface PresetCategory {
  sectorId: string;
  categoryId: string;
  presets: string[];
}

export const DESCRIPTION_PRESETS: PresetCategory[] = [
  {
    sectorId: 'food-and-drink',
    categoryId: 'restaurants',
    presets: [
      'A cozy neighborhood restaurant offering seasonal, locally sourced dishes in a warm, welcoming environment. Join us for classic comfort food with a modern twist.',
      'We bring authentic culinary traditions to your table with freshly prepared specialty dishes, curated ingredients, and a passion for exceptional service.',
      'Experience casual dining at its best: vibrant flavor profiles, freshly hand-crafted recipes, and a community-centered atmosphere perfect for families and friends.'
    ]
  },
  {
    sectorId: 'food-and-drink',
    categoryId: 'cafes',
    presets: [
      'Your local go-to spot for artisanal coffee, fresh pastries made daily, and light lunch options. A perfect workspace or meeting place with friendly vibes.',
      'Specialty coffee shop dedicated to sustainably sourced beans, expertly brewed espresso drinks, and a select menu of wholesome breakfast treats.',
      'A charming, community-focused cafe serving premium tea blends, single-origin coffees, and a delicious selection of homemade cakes and sandwiches.'
    ]
  },
  {
    sectorId: 'health-and-beauty',
    categoryId: 'hair-salons',
    presets: [
      'A modern boutique hair salon offering precision haircuts, customized coloring services, and luxury hair treatments tailored to your unique style.',
      'Dedicated to providing exceptional styling, hair care, and professional advice in a relaxed and friendly atmosphere. Book your transformation today!',
      'Premium hair design studio specializing in balayage, highlight techniques, treatments, and bridal styles using eco-friendly products.'
    ]
  },
  {
    sectorId: 'health-and-beauty',
    categoryId: 'nail-salons',
    presets: [
      'Professional nail salon offering luxury manicures, pedicures, acrylics, and custom nail art designs in a pristine, hygienic environment.',
      'Relax and pamper yourself with our wide selection of nail therapies, gel polishes, and soothing spa treatments designed to restore and beautify.',
      'Your friendly local nail bar specializing in premium nail care, durable gel coatings, and creative, bespoke hand-painted nail artwork.'
    ]
  },
  {
    sectorId: 'building-and-trades',
    categoryId: 'builders',
    presets: [
      'Reliable, family-run building services specializing in home renovations, extensions, conversions, and high-quality general construction.',
      'Professional building contractors dedicated to delivering projects on time and within budget, with exceptional attention to details and building standards.',
      'Bespoke building and restoration services for residential and commercial spaces. Fully insured, certified, and committed to excellent craftsmanship.'
    ]
  }
];

export const getDefaultPresets = (): string[] => [
  'A dedicated local business serving our community with quality products and dependable services. Customer satisfaction is our top priority.',
  'Your friendly neighborhood choice, focused on bringing you high-quality options, professional service, and a friendly atmosphere.',
  'Dedicated to excellence in everything we do. We strive to provide premium value, reliable service, and positive local impact.'
];
