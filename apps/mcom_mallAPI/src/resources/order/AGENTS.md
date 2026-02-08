## Order/Checkout Endpoint Documentation

This document provides a detailed explanation of the `order/checkout` endpoint, including its payload and response interfaces.

### Endpoint

`POST /order/checkout`

This endpoint is used to finalize a purchase, which can include physical products from the user's cart, new gift card purchases, or a combination of both. It supports the application of coupons, gift cards, and vouchers for payment.

### Authentication

This endpoint requires user authentication via a JWT token. The authenticated user's ID is used to associate the order with the user.

### Payload Interface (`CreateCheckoutDto`)

The payload for the checkout endpoint is a JSON object with the following structure:

```typescript
interface CreateCheckoutDto {
  // Details about the payment being made.
  payment: {
    // The method of payment.
    paymentMethod: 'card' | 'paypal' | 'applepay';
    // The transaction ID from the payment provider.
    transactionId: string;
    // The total amount paid.
    amount: number;
  };

  // Optional field for a "Buy Now" purchase of a single product.
  // If this is provided, the user's cart will not be processed.
  directPurchase?: {
    productId: string;
    quantity: number;
  };

  // An optional array of gift cards to be purchased.
  giftCardPurchases?: {
    // The ID of the business for which the gift card is being purchased.
    businessId: string;
    // The value of the gift card.
    amount: number;
    // The recipient's email address.
    recipientEmail: string;
    // An optional message to the recipient.
    message?: string;
    // The sender's name.
    fromName: string;
  }[];

  // An optional coupon code to apply a discount.
  couponCode?: string;

  // An optional offer ID to be redeemed.
  offerId?: string;

  // An optional gift card code to be redeemed against the purchase total.
  giftCardCode?: string;

  // An optional voucher code to be redeemed against the purchase total.
  voucherCode?: string;
}
```

### Response Interface (`Order`)

The endpoint returns an `Order` object upon successful checkout. The structure of the response is as follows:

```typescript
interface Order {
  // The unique identifier for the order.
  id: string;

  // The user who placed the order.
  user: {
    id: string;
    email: string;
    // ... other user properties
  };

  // The items included in the order.
  items: {
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
      // ... other product properties
    };
    quantity: number;
    price: number;
  }[];

  // The total amount of the order after all discounts and redemptions.
  total: number;

  // Details of the payment made for the order.
  payment: {
    id: string;
    paymentMethod: 'card' | 'paypal' | 'applepay';
    transactionId: string;
    amount: number;
    currency: string;
  };

  // The offer that was applied to the order, if any.
  appliedOffer?: {
    id: string;
    // ... other offer properties
  };

  // The number of points used to redeem the offer, if any.
  pointsUsedToRedeem?: number;

  // Vouchers created or used in this order.
  vouchers: {
    id: string;
    code: string;
    // ... other voucher properties
  }[];

  // The current status of the order.
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'SHIPPED';

  // The amount applied from a gift card, if any.
  giftCardAmountApplied?: number;

  // The code of the gift card that was used, if any.
  giftCardCode?: string;

  // Timestamps for creation and update.
  createdAt: string;
  updatedAt: string;
}
```

### Usage Flow

There are two main flows for using this endpoint:

**1. Standard Cart Checkout:**
   - The user adds one or more items to their shopping cart.
   - The client constructs the `CreateCheckoutDto` payload **without** the `directPurchase` field. The service will automatically use the items in the user's cart.

**2. Direct Purchase ("Buy Now"):**
   - The user decides to buy a single product immediately, without affecting their cart.
   - The client constructs the `CreateCheckoutDto` payload, including the `directPurchase` object with the `productId` and `quantity`. The user's cart will be ignored for this transaction.

For both flows, the client makes the payment to get a `transactionId`, calls the endpoint with the appropriate payload, and the server processes the order and returns the `Order` object.