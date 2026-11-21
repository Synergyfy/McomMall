#!/usr/bin/env node
/**
 * Payment boundary guard.
 *
 * Feature modules must call `PaymentOrchestratorService`, never the provider
 * transport primitives directly. Only `src/resources/payments/**` may use them.
 *
 * Exits non-zero when a forbidden call is found, so CI fails the PR.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'resources');
const paymentsDir = path.join(root, 'payments');
const forbidden =
  /\b(createStripePaymentIntent|createPaypalOrder|createWalletHold|createWalletCharge|verifyStripePaymentIntent|captureAndVerifyPaypalOrder|settleWalletReference|refundStripePayment|refundPaypalOrder)\s*\(/;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full === paymentsDir) continue;
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      yield full;
    }
  }
}

const violations = [];
for (const file of walk(root)) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split('\n');
  lines.forEach((line, index) => {
    if (forbidden.test(line)) {
      violations.push(`${path.relative(path.join(__dirname, '..'), file)}:${index + 1}  ${line.trim()}`);
    }
  });
}

if (violations.length > 0) {
  console.error('Payment boundary violation: use PaymentOrchestratorService instead.\n');
  violations.forEach((violation) => console.error(`  ${violation}`));
  process.exit(1);
}

console.log('Payment boundaries OK: no feature module calls the provider transport directly.');
