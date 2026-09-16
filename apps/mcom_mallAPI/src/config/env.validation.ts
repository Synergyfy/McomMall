import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Mandatory secrets - the application must fail fast if these are missing.
  COOKIE_SECRET: Joi.string().required(),
  STRIPE_SECRET_KEY: Joi.string().required(),
  PAYPAL_CLIENT_ID: Joi.string().required(),
  PAYPAL_CLIENT_SECRET: Joi.string().required(),

  // MCOM Wallet (centralized payments via MCOM Solutions) — required when
  // MCOM_WALLET_ENABLED is not explicitly 'false'.
  MCOM_SOLUTIONS_URL: Joi.string().uri().allow('').optional(),
  MCOM_SOLUTIONS_BACKEND_URL: Joi.string().uri().allow('').optional(),
  MCOM_SOLUTIONS_FRONTEND_URL: Joi.string().uri().allow('').optional(),
  MCOM_CLIENT_ID: Joi.string().allow('').optional(),
  MCOM_HMAC_SECRET: Joi.string().allow('').optional(),
  MCOM_WALLET_ENABLED: Joi.string()
    .valid('true', 'false', 'True', 'False', 'TRUE', 'FALSE')
    .allow('')
    .optional(),
  // Embedded Solutions card top-up (proxied user-scoped top-up APIs).
  TOKEN_ENCRYPTION_KEY: Joi.string().allow('').optional(),
  MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY: Joi.string().allow('').optional(),

  // Royal Mail integration is optional; pricing falls back to DB rates when
  // credentials are not configured.
  ROYAL_MAIL_CLIENT_ID: Joi.string().allow('').optional(),
  ROYAL_MAIL_CLIENT_SECRET: Joi.string().allow('').optional(),
});
