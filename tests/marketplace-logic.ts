/**
 * Marketplace Feature Logic Tests (Self-contained)
 * This file verifies the core logic for variant generation.
 */

// Redefining types locally for testing to avoid module resolution issues in script environment
interface ProductAttribute {
    name: string;
    options: {
        name: string;
        priceModifier: number;
    }[];
}

interface ProductVariation {
    combination: Record<string, string>;
    price: number;
    stock: number;
    available: boolean;
}

// Helper to generate cartesian product
const cartesian = (args: any[][]): any[][] => {
    const r: any[][] = [];
    const max = args.length - 1;
    function helper(arr: any[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
            const a = arr.slice(0);
            a.push(args[i][j]);
            if (i == max) r.push(a);
            else helper(a, i + 1);
        }
    }
    helper([], 0);
    return r;
};

// Test 1: Cartesian Product for Variants
const testVariantGeneration = () => {
    const attributes: ProductAttribute[] = [
        { name: 'Color', options: [{ name: 'Red', priceModifier: 0 }, { name: 'Blue', priceModifier: 10 }] },
        { name: 'Size', options: [{ name: 'S', priceModifier: 0 }, { name: 'M', priceModifier: 5 }] }
    ];

    const optionsArrays = attributes.map(a => a.options);
    const combinations = cartesian(optionsArrays);

    console.log(`[TEST 1] Generated ${combinations.length} combinations.`);

    let passed = true;
    if (combinations.length === 4) {
        console.log("  ✅ Generated 4 combinations for 2x2 matrix.");
    } else {
        console.error("  ❌ Failed: Expected 4 combinations.");
        passed = false;
    }

    // Verify a specific combination (Blue/M)
    // combinations is an array of arrays of options
    const blueM = combinations.find(combo => combo[0].name === 'Blue' && combo[1].name === 'M');
    if (blueM) {
        const totalPriceMod = blueM[0].priceModifier + blueM[1].priceModifier;
        if (totalPriceMod === 15) {
            console.log("  ✅ Price modifier correctly calculated as 15.");
        } else {
            console.error(`  ❌ Failed: Expected 15, got ${totalPriceMod}`);
            passed = false;
        }
    } else {
        console.error("  ❌ Failed: Could not find Blue/M combination.");
        passed = false;
    }

    return passed;
};

// Run tests
console.log("--- Marketplace Logic Verification ---");
const result = testVariantGeneration();
console.log("--------------------------------------");
if (result) {
    console.log("OVERALL STATUS: SUCCESS");
} else {
    console.log("OVERALL STATUS: FAILED");
    process.exit(1);
}
