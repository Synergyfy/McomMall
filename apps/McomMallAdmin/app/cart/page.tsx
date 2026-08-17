'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const {
    cart,
    loading,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCart();

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
    (acc, item) => acc + item.product.price * item.quantity,
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
                    <img
                      src={
                        item.product.imageUrl ||
                        'https://via.placeholder.com/100'
                      }
                      alt={item.product.title}
                      width={100}
                      height={100}
                      className="rounded-md"
                    />
                  </Link>
                  <div>
                    <Link href={`/products/${item.product.id}`}>
                      <h2 className="font-semibold hover:underline">
                        {item.product.title}
                      </h2>
                    </Link>
                    <p className="text-gray-500">
                      £{item.product.price.toFixed(2)}
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
