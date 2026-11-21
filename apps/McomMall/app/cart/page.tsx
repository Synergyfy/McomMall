'use client';

import { useCart, CartItem } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import { getProductMainImage } from '@/lib/utils';

export default function CartPage() {
  const {
    cart,
    loading,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCart();

  const calculateItemPrice = useCallback((item: CartItem) => {
    let price = (item.product.salePrice && item.product.salePrice < item.product.price)
      ? item.product.salePrice
      : item.product.price;
    if (item.selectedVariants && item.product.variants) {
        item.product.variants.forEach((v) => {
            const selectedOption = item.selectedVariants?.[v.name];
            if (selectedOption) {
                const option = v.options.find((o) => o.name === selectedOption);
                if (option) {
                    price += Number(option.priceModifier) || 0;
                }
            }
        });
    }
    return price;
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-12 text-center">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            {/* Soft decorative background shapes */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-50" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-slate-50" />

            <div className="relative">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 ring-8 ring-orange-50/60">
                <ShoppingCart className="h-11 w-11 text-orange-500" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-orange-500">
                Your cart
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Your cart is feeling light
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
                You haven&apos;t added anything yet. Discover local products,
                services, vouchers and gift cards from businesses near you.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600 sm:w-auto"
                >
                  <Link href="/marketplace">
                    Start shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Link href="/dashboard/wishlist">
                    <Heart className="mr-2 h-4 w-4" />
                    View your wishlist
                  </Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="font-medium text-slate-500">
                  Popular right now:
                </span>
                <Link
                  href="/products"
                  className="font-semibold text-slate-600 transition-colors hover:text-orange-600"
                >
                  Products
                </Link>
                <Link
                  href="/services"
                  className="font-semibold text-slate-600 transition-colors hover:text-orange-600"
                >
                  Services
                </Link>
                <Link
                  href="/vouchers"
                  className="font-semibold text-slate-600 transition-colors hover:text-orange-600"
                >
                  Vouchers
                </Link>
                <Link
                  href="/gift-cards"
                  className="font-semibold text-slate-600 transition-colors hover:text-orange-600"
                >
                  Gift Cards
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateCartItem({ productId, quantity: newQuantity });
    } else {
      removeCartItem(productId);
    }
  };

  const total = cart.items.reduce(
    (acc, item) => acc + calculateItemPrice(item) * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 pt-28 pb-12">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Link href={`/products/${item.product.id}`}>
                    <img
                      src={
                        getProductMainImage(item.product) ||
                        '/images/placeholder.svg'
                      }
                      alt={item.product.title}
                      width={100}
                      height={100}
                      className="rounded-md object-cover"
                    />
                  </Link>
                  <div>
                    <Link href={`/products/${item.product.id}`}>
                      <h2 className="font-semibold hover:underline">
                        {item.product.title}
                      </h2>
                    </Link>
                    {item.selectedVariants && (
                        <div className="text-sm text-gray-500 mt-1">
                            {Object.entries(item.selectedVariants).map(([key, value]) => (
                                <span key={key} className="mr-3 inline-block bg-gray-100 px-2 py-0.5 rounded">
                                    <span className="font-medium">{key}:</span> {value as string}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-gray-500 mt-1 font-medium">
                      £{calculateItemPrice(item).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleQuantityChange(item.product.id, item.quantity - 1)
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={e =>
                      handleQuantityChange(
                        item.product.id,
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleQuantityChange(item.product.id, item.quantity + 1)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCartItem(item.product.id)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-6 border rounded-lg sticky top-8">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>£{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>
            <Button asChild className="w-full mt-6">
              <Link href="/checkout?from=cart">Proceed to Checkout</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
