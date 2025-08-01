import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

export default function PaymentResult() {
  const [, setLocation] = useLocation();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { clearCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const reference = urlParams.get('reference');
    const amount = urlParams.get('amount');
    const orderId = urlParams.get('order_id');
    const reason = urlParams.get('reason');

    console.log('Payment result params:', { status, reference, amount, orderId, reason });

    if (status === 'success') {
      // Clear cart on successful payment
      try {
        clearCart();
        console.log('Cart cleared successfully after payment');
      } catch (error) {
        console.warn('No cart items found for payment callback');
      }
      
      // Show success toast
      toast({
        title: "Payment Successful!",
        description: `Your payment of GH₵${amount} has been processed successfully.`,
      });
    } else if (status === 'failed') {
      // Show failure toast
      toast({
        title: "Payment Failed",
        description: getFailureMessage(reason),
        variant: "destructive"
      });
    }

    setPaymentDetails({
      status,
      reference,
      amount: amount ? parseFloat(amount) : 0,
      orderId,
      reason
    });
  }, [clearCart, toast]);

  const getFailureMessage = (reason: string | null) => {
    switch (reason) {
      case 'payment_not_found':
        return 'Payment record not found. Please contact support.';
      case 'payment_failed':
        return 'Payment was not successful. Please try again.';
      case 'verification_error':
        return 'Payment verification failed. Please contact support.';
      case 'no_reference':
        return 'No payment reference provided.';
      default:
        return 'Payment failed. Please try again or contact support.';
    }
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {paymentDetails.status === 'success' ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-black">
            {paymentDetails.status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentDetails.status === 'success' ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount:</span>
                    <span className="font-medium text-green-800">GH₵{paymentDetails.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Reference:</span>
                    <span className="font-medium text-green-800">{paymentDetails.reference}</span>
                  </div>
                  {paymentDetails.orderId && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Order ID:</span>
                      <span className="font-medium text-green-800">{paymentDetails.orderId}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center text-gray-600">
                <p>Your order has been confirmed and will be processed shortly.</p>
                <p className="mt-2 text-sm">You will receive a confirmation email with order details.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Payment Failed</h3>
                <p className="text-sm text-red-700">{getFailureMessage(paymentDetails.reason)}</p>
                {paymentDetails.reference && (
                  <p className="text-sm text-red-700 mt-2">
                    Reference: {paymentDetails.reference}
                  </p>
                )}
              </div>
              
              <div className="text-center text-gray-600">
                <p>Don't worry, no charges were made to your account.</p>
                <p className="mt-2 text-sm">Please try again or contact support if the problem persists.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            {paymentDetails.status === 'success' ? (
              <>
                <Button 
                  onClick={() => setLocation('/orders')}
                  className="w-full btn-orange-primary"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
                <Button 
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => setLocation('/cart')}
                  className="w-full btn-orange-primary"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Shopping
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}