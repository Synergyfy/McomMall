import { OmitType } from '@nestjs/swagger';
import { CreateCheckoutDto } from './create-checkout.dto';

/**
 * The same pricing inputs as checkout, without the payment details. Used by the
 * server-authoritative quote endpoint so the storefront never has to reproduce
 * discount, scope or service-booking maths in the browser.
 */
export class QuoteCheckoutDto extends OmitType(CreateCheckoutDto, [
  'payment',
] as const) {}
