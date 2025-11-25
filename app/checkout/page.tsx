"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle } from 'lucide-react';

interface DialogContent {
  open: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onConfirm: () => void;
}

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [paymentOption, setPaymentOption] = useState('full');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>({
    open: false,
    title: '',
    description: '',
    icon: null,
    onConfirm: () => {},
  });

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error("You must be logged in to proceed to checkout.");
        router.push('/auth');
      } else if (cartItems.length === 0) {
        toast.info("Your cart is empty. Add some courses to proceed.");
        router.push('/courses');
      }
    }
  }, [user, authLoading, cartItems, router]);

  const handlePurchase = async () => {
    setIsProcessing(true);
    toast.info("Processing your enrollment...");

    try {
      const enrollPromises = cartItems.map(item => {
        return fetch('/api/enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: item._id, paymentOption }),
        });
      });

      const results = await Promise.all(enrollPromises);
      const failedEnrollments = results.filter(res => !res.ok);

      if (failedEnrollments.length > 0) {
        const errorMessages = await Promise.all(
          failedEnrollments.map(res => res.json().then(err => err.message || 'Unknown error'))
        );
        const uniqueMessages = [...new Set(errorMessages)];
        throw new Error(uniqueMessages.join('; '));
      }

      setDialogContent({
        open: true,
        title: "Enrollment Successful!",
        description: "You have been successfully enrolled in the new courses.",
        icon: <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />,
        onConfirm: () => {
          router.push('/student/profile');
          clearCart();
        },
      });

    } catch (error) {
      setDialogContent({
        open: true,
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred during enrollment.',
        icon: <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />,
        onConfirm: () => {
          router.push('/courses');
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || !user || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Checkout</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item._id.toString()} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <hr className="border-slate-600" />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup defaultValue="full" onValueChange={setPaymentOption}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full">Full Payment (${total.toFixed(2)})</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial">Partial Payment (50% - ${(total / 2).toFixed(2)})</Label>
                  </div>
                </RadioGroup>
                <Button className="w-full" onClick={handlePurchase} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Confirm Purchase'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={dialogContent.open} onOpenChange={(open) => setDialogContent(prev => ({...prev, open}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {dialogContent.icon}
            <AlertDialogTitle className="text-center">{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={dialogContent.onConfirm} className="w-full">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
