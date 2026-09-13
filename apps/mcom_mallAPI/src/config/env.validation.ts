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

  // Royal Mail integration is optional; pricing falls back to DB rates when
  // credentials are not configured.
  ROYAL_MAIL_CLIENT_ID: Joi.string().allow('').optional(),
  ROYAL_MAIL_CLIENT_SECRET: Joi.string().allow('').optional(),
});
