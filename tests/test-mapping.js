
const sizeMapping = {
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

function testMapping(size) {
    const mapped = sizeMapping[size];
    console.log(`${size} -> ${mapped}`);
    if (sizeMapping[mapped] !== size) {
        console.error(`Inconsistent mapping for ${size}`);
    }
}

['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44'].forEach(testMapping);
