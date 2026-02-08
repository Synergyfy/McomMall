export enum ListingType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

export enum BusinessStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum ServiceModel {
  AT_LOCATION = 'at_location',
  TRAVEL_TO_CUSTOMER = 'travel_to_customer',
  BOTH = 'both',
}

export enum SellingMode {
  PICKUP = 'pickup',
  LOCAL_DELIVERY = 'local_delivery',
  UK_SHIPPING = 'uk_shipping',
}

export enum StorefrontPlatform {
  SHOPIFY = 'shopify',
  AMAZON = 'amazon',
  EBAY = 'ebay',
  ETSY = 'etsy',
  WOOCOMMERCE = 'woocommerce',
}
