"use client";

import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <p className="text-xl mb-4">Your cart is empty.</p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3">
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Cart Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={String(item._id)} className="flex justify-between items-center p-4 rounded-lg bg-slate-800/50">
                          <div>
                            <p className="font-semibold text-lg">{item.name}</p>
                            <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item._id)}>
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:w-1/3">
                <Card className="bg-white/10 border-white/20 text-white sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
