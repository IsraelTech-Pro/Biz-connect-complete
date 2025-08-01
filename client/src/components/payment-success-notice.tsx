import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const PaymentSuccessNotice = () => {
  const [showNotice, setShowNotice] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user just returned from payment
    const checkPaymentReturn = () => {
      const storedReference = localStorage.getItem('pending_payment_reference');
      const storedAmount = localStorage.getItem('pending_payment_amount');
      const storedEmail = localStorage.getItem('pending_payment_email');
      
      if (storedReference && storedAmount && storedEmail) {
        setPaymentDetails({
          reference: storedReference,
          amount: parseFloat(storedAmount),
          email: storedEmail
        });
        setShowNotice(true);
        
        // Automatically process the payment after showing notice
        setTimeout(() => {
          processPaymentReturn(storedReference, storedAmount, storedEmail);
        }, 3000);
      }
    };
    
    checkPaymentReturn();
  }, []);

  const processPaymentReturn = async (reference: string, amount: string, email: string) => {
    try {
      // Verify payment
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference })
      });
      
      const data = await response.json();
      
      if (data.status && data.data.status === 'success') {
        // Create orders
        await createOrdersFromPayment(reference, amount, email);
        
        // Clear stored data
        localStorage.removeItem('pending_payment_reference');
        localStorage.removeItem('pending_payment_amount');
        localStorage.removeItem('pending_payment_email');
        
        setShowNotice(false);
        
        toast({
          title: "Order Created Successfully!",
          description: "Your payment has been processed and orders have been created.",
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Processing Error",
        description: "There was an issue processing your payment. Please contact support.",
        variant: "destructive"
      });
      setShowNotice(false);
    }
  };

  const createOrdersFromPayment = async (reference: string, amount: string, email: string) => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (cartItems.length === 0) {
        throw new Error('No cart items found');
      }
      
      for (const item of cartItems) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            vendor_id: item.product.vendor_id,
            product_id: item.product.id,
            quantity: item.quantity,
            amount: parseFloat(item.product.price) * item.quantity,
            payment_id: reference,
            buyer_email: email,
            buyer_phone: localStorage.getItem('checkout_phone') || '',
            delivery_address: localStorage.getItem('checkout_address') || '',
            status: 'pending'
          })
        });
      }
      
      // Clear cart and checkout data
      localStorage.removeItem('cart');
      localStorage.removeItem('checkout_phone');
      localStorage.removeItem('checkout_address');
      
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  };

  if (!showNotice) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
    >
      <Card className="bg-green-50 border-green-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-green-700">
            <p>Amount: GH₵ {paymentDetails?.amount.toFixed(2)}</p>
            <p>Reference: {paymentDetails?.reference}</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm">Creating your orders...</span>
          </div>
          
          <Button 
            onClick={() => {
              if (paymentDetails) {
                processPaymentReturn(paymentDetails.reference, paymentDetails.amount.toString(), paymentDetails.email);
              }
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};