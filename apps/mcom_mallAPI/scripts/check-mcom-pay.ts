import axios from 'axios';

/**
 * Read-only MCOM Pay configuration / reachability check.
 *
 * Usage:
 *   pnpm --filter @mcommall/api check:mcom-pay
 *
 * This deliberately does not create a charge. It confirms the env is complete
 * and that Central's public discovery endpoint is reachable from the API host.
 */
async function main() {
  const solutionsUrl =
    process.env.MCOM_SOLUTIONS_URL ||
    process.env.MCOM_SOLUTIONS_BACKEND_URL ||
    process.env.MCOM_CENTRAL_URL ||
    'http://localhost:3010';
  const centralBase = solutionsUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

  const enabled =
    (process.env.MCOM_PAY_ENABLED || 'true').toLowerCase() !== 'false';
  const checks = {
    mcomPayEnabled: enabled,
    walletEnabled:
      (process.env.MCOM_WALLET_ENABLED || 'true').toLowerCase() !== 'false',
    hmacSecretConfigured: !!process.env.MCOM_HMAC_SECRET,
    webhookSecretConfigured: !!process.env.MCOM_WEBHOOK_SECRET,
    webhookUrl:
      process.env.MCOM_WEBHOOK_URL ||
      `http://localhost:${process.env.PORT || 3006}/api/v1/payments/mcom/webhook`,
    centralBase,
    centralReachable: false,
  };

  try {
    const response = await axios.get(
      `${centralBase}/api/v1/ecosystem/discovery`,
      { timeout: 5000 },
    );
    checks.centralReachable = response.status >= 200 && response.status < 500;
  } catch (error) {
    checks.centralReachable = false;
    console.error(
      'Central discovery request failed:',
      error instanceof Error ? error.message : error,
    );
  }

  console.log(JSON.stringify(checks, null, 2));

  if (!checks.mcomPayEnabled) {
    process.exitCode = 1;
    console.error('MCOM_PAY_ENABLED is false — customer payments will fail closed.');
  }
  if (!checks.hmacSecretConfigured || !checks.webhookSecretConfigured) {
    process.exitCode = 1;
    console.error('MCOM Pay HMAC/webhook secrets are incomplete.');
  }
  if (!checks.centralReachable) {
    process.exitCode = 1;
    console.error('Central is not reachable from this API process.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
