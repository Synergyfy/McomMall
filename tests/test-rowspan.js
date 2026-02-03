
function calculateRowSpans(variations, attributes) {
    if (variations.length === 0 || attributes.length === 0) return [];

    const spans = variations.map(() => ({}));

    attributes.forEach((attr, attrIdx) => {
        let spanStart = 0;

        variations.forEach((v, rowIdx) => {
            const val = v.combination[attr.name];
            const prevVal = rowIdx > 0 ? variations[rowIdx - 1].combination[attr.name] : null;

            const parentMatch = attributes.slice(0, attrIdx).every(parentAttr =>
                rowIdx > 0 && v.combination[parentAttr.name] === variations[rowIdx - 1].combination[parentAttr.name]
            );

            if (rowIdx > 0 && val === prevVal && (attrIdx === 0 || parentMatch)) {
                spans[spanStart][attr.name]++;
                spans[rowIdx][attr.name] = 0;
            } else {
                spans[rowIdx][attr.name] = 1;
                spanStart = rowIdx;
            }
        });
    });

    return spans;
}

const attributes = [
    { name: 'Color' },
    { name: 'Size' },
    { name: 'Material' }
];

const variations = [
    { combination: { Color: 'Red', Size: 'S', Material: 'Cotton' } },
    { combination: { Color: 'Red', Size: 'S', Material: 'Silk' } },
    { combination: { Color: 'Blue', Size: 'S', Material: 'Cotton' } },
    { combination: { Color: 'Blue', Size: 'S', Material: 'Silk' } }
];

const spans = calculateRowSpans(variations, attributes);
console.log(JSON.stringify(spans, null, 2));
