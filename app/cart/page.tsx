'use client';

import { useCart, CartItem } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';

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
        // We cast variants to any[] because CartItem.product is any, avoiding TS errors for now
        // Ideally we should type CartItem properly
        (item.product.variants as any[]).forEach((v: any) => {
            const selectedOption = item.selectedVariants?.[v.name];
            if (selectedOption) {
                const option = v.options.find((o: any) => o.name === selectedOption);
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
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/listings">
          <Button>Start Shopping</Button>
        </Link>
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
    <div className="container mx-auto px-4 py-8">
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
                    <Image
                      src={
                        item.product.imageUrl ||
                        (item.product.fileUrls && item.product.fileUrls[0]) ||
                        'https://via.placeholder.com/100'
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
            <Link href="/checkout?from=cart">
              <Button className="w-full mt-6">Proceed to Checkout</Button>
            </Link>
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
