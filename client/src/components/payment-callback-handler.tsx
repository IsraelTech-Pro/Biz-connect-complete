import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const PaymentCallbackHandler = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Check for payment callback in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paymentReference = urlParams.get('payment_reference');
    const paymentStatus = urlParams.get('payment_status');
    
    if (paymentReference && paymentStatus === 'success') {
      // Get stored payment details
      const storedReference = localStorage.getItem('pending_payment_reference');
      const storedAmount = localStorage.getItem('pending_payment_amount');
      const storedEmail = localStorage.getItem('pending_payment_email');
      
      if (storedReference === paymentReference) {
        // Payment successful - trigger order creation
        createOrdersFromPayment(paymentReference, storedAmount, storedEmail);
        
        // Clear stored payment data
        localStorage.removeItem('pending_payment_reference');
        localStorage.removeItem('pending_payment_amount');
        localStorage.removeItem('pending_payment_email');
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast({
          title: "Payment Successful!",
          description: `Your mobile money payment has been processed successfully.`,
        });
      }
    } else if (paymentStatus === 'failed') {
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Payment Failed",
        description: "Your payment was not successful. Please try again.",
        variant: "destructive"
      });
    }
    
    // Also check for pending payments on page load (in case user manually navigates back)
    const checkPendingPayment = async () => {
      const storedReference = localStorage.getItem('pending_payment_reference');
      const storedAmount = localStorage.getItem('pending_payment_amount');
      const storedEmail = localStorage.getItem('pending_payment_email');
      
      if (storedReference && storedAmount && storedEmail) {
        // Check if payment was successful
        try {
          const response = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reference: storedReference })
          });
          
          const data = await response.json();
          
          if (data.status && data.data.status === 'success') {
            // Payment was successful, create orders
            createOrdersFromPayment(storedReference, storedAmount, storedEmail);
            
            // Clear stored payment data
            localStorage.removeItem('pending_payment_reference');
            localStorage.removeItem('pending_payment_amount');
            localStorage.removeItem('pending_payment_email');
            
            toast({
              title: "Payment Successful!",
              description: `Your mobile money payment has been processed successfully.`,
            });
          }
        } catch (error) {
          console.error('Payment verification error:', error);
        }
      }
    };
    
    // Check for pending payments after a short delay
    const timer = setTimeout(checkPendingPayment, 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const createOrdersFromPayment = async (reference: string, amount: string, email: string) => {
    try {
      // Get cart items from localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (cartItems.length === 0) {
        console.warn('No cart items found for payment callback');
        return;
      }
      
      // Create orders for each cart item
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
      
      // Clear cart after successful order creation
      localStorage.removeItem('cart');
      localStorage.removeItem('checkout_phone');
      localStorage.removeItem('checkout_address');
      
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Creation Failed",
        description: "Payment successful but order creation failed. Please contact support.",
        variant: "destructive"
      });
    }
  };

  return null; // This component doesn't render anything
};