export enum PricingModel {
  FIXED = 'fixed',
  PER_HOUR = 'perHour',
  PER_UNIT = 'perUnit',
  PER_JOB = 'perJob',
  PER_DISTANCE = 'perDistance',
  PER_SESSION = 'perSession',
  SUBSCRIPTION = 'subscription',
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
  HYBRID = 'hybrid',
}

export enum VariantType {
  TIME = 'time',
  RESOURCE = 'resource',
}
