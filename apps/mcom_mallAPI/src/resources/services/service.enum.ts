export enum PricingModel {
  FIXED = 'fixed',
  PER_HOUR = 'perHour',
  PER_UNIT = 'perUnit',
  PER_JOB = 'perJob',
  PER_DISTANCE = 'perDistance',
  PER_SESSION = 'perSession',
  SUBSCRIPTION = 'subscription',
}

/**
 * Customer-facing pricing options exposed by the Create Service flow.
 * `pricingModel` is kept for backwards compatibility with bookings, checkout
 * and older API clients; it is derived from this value on write.
 */
export enum PricingType {
  FIXED = 'fixed',
  STARTING_FROM = 'startingFrom',
  RANGE = 'range',
  HOURLY = 'hourly',
  QUOTE = 'quote',
  FREE = 'free',
}

export enum ServiceDeliveryOption {
  AT_BUSINESS = 'atBusiness',
  AT_CUSTOMER = 'atCustomer',
  ONLINE = 'online',
}

export enum CustomerAction {
  BOOK_NOW = 'bookNow',
  REQUEST_QUOTE = 'requestQuote',
  ENQUIRY = 'enquiry',
  CONTACT_BUSINESS = 'contactBusiness',
}

export enum GuestPricingModel {
  PER_GUEST = 'perGuest',
  FIXED_GROUP = 'fixedGroup',
  BASE_WITH_ADDITIONAL = 'baseWithAdditional',
}

export enum AddonPricingType {
  ONE_TIME = 'oneTime',
  PER_GUEST = 'perGuest',
  PER_UNIT = 'perUnit',
}

export enum DeliveryMode {
  ONSITE = 'onsite',
  AT_SHOP = 'atShop',
  REMOTE = 'remote',
}

export enum VariantType {
  TIME = 'time',
  RESOURCE = 'resource',
}
