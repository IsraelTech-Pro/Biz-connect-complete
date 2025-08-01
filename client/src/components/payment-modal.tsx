import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Smartphone, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { PaymentReturnGuide } from './payment-return-guide';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  orderData?: {
    items: Array<{ product: any; quantity: number }>;
    deliveryInfo: any;
  };
}

export const PaymentModal = ({ isOpen, onClose, amount, email, onSuccess, orderData }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money'>('card');
  const [mobileNumber, setMobileNumber] = useState('');
  const [network, setNetwork] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [showReturnGuide, setShowReturnGuide] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  // Fetch Paystack public key
  React.useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await fetch('/api/paystack/public-key');
        const data = await response.json();
        setPublicKey(data.publicKey);
      } catch (error) {
        console.error('Failed to fetch Paystack public key:', error);
      }
    };
    
    if (isOpen) {
      fetchPublicKey();
    }
  }, [isOpen]);

  const initializePayment = async () => {
    if (!publicKey) {
      toast({
        title: "Configuration Error",
        description: "Payment system is not configured. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // For mobile money payments, use backend initialization to pre-populate data
    if (paymentMethod === 'mobile_money') {
      if (!mobileNumber || !network) {
        toast({
          title: "Missing Information",
          description: "Please provide mobile number and select network.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Validate mobile number format
      if (mobileNumber.length < 9) {
        toast({
          title: "Invalid Mobile Number",
          description: "Please enter a valid mobile number.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      try {
        // Check if user is authenticated
        if (!token) {
          throw new Error('User not authenticated');
        }
        
        // Initialize mobile money payment through backend
        const response = await fetch('/api/payments/initialize-mobile-money', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: email,
            amount: amount,
            mobile_number: mobileNumber,
            provider: network
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Mobile money initialization failed - HTTP error:', response.status, errorData);
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to initialize payment`);
        }
        
        const data = await response.json();
        console.log('Mobile money initialization response:', data);
        
        if (data.status && data.data && data.data.authorization_url) {
          // Store payment reference in localStorage for callback handling
          localStorage.setItem('pending_payment_reference', data.data.reference);
          localStorage.setItem('pending_payment_amount', amount.toString());
          localStorage.setItem('pending_payment_email', email);
          localStorage.setItem('pending_payment_order_id', data.data.order_id);
          
          // Show guide before redirecting
          setShowReturnGuide(true);
          
          // Redirect after a delay
          setTimeout(() => {
            window.location.href = data.data.authorization_url;
          }, 5000);
        } else {
          console.error('Mobile money initialization failed:', data);
          throw new Error(data.message || 'Failed to initialize mobile money payment');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setIsProcessing(false);
        toast({
          title: "Payment Error",
          description: "Failed to initialize mobile money payment. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // For card payments, use the inline popup
      try {
        // Load Paystack script if not already loaded
        if (!window.PaystackPop) {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.onload = () => processCardPayment();
          document.body.appendChild(script);
        } else {
          processCardPayment();
        }
      } catch (error) {
        console.error('Payment initialization error:', error);
        setIsProcessing(false);
        toast({
          title: "Payment Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const processCardPayment = () => {
    try {
      const paymentConfig: any = {
        key: publicKey,
        email: email,
        amount: amount * 100, // Convert to kobo
        currency: 'GHS',
        ref: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        channels: ['card'], // Only card payments for inline popup
        callback: (response: any) => {
          console.log('Payment callback response:', response);
          setIsProcessing(false);
          onSuccess(response.reference);
          onClose();
          toast({
            title: "Payment Successful!",
            description: `Payment completed successfully. Reference: ${response.reference}`,
          });
        },
        onClose: () => {
          console.log('Payment popup closed');
          setIsProcessing(false);
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled by user.",
            variant: "destructive"
          });
        }
      };
      
      console.log('Initializing card payment with config:', paymentConfig);

      const handler = window.PaystackPop.setup(paymentConfig);
      handler.openIframe();
    } catch (error) {
      console.error('Card payment setup error:', error);
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: "Failed to initialize card payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Secure Payment
            </DialogTitle>
            <DialogDescription>
              Complete your payment securely using Paystack. Choose between card payment or mobile money to proceed with your order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span>Total Amount:</span>
                <span className="font-bold text-lg">GH₵ {amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm">Card Payment</span>
                </Button>
                <Button
                  variant={paymentMethod === 'mobile_money' ? 'default' : 'outline'}
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => setPaymentMethod('mobile_money')}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-sm">Mobile Money</span>
                </Button>
              </div>
            </div>

            {/* Card Payment Info */}
            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 rounded-lg p-4"
              >
                <h4 className="font-semibold mb-2">Card Payment</h4>
                <p className="text-sm text-gray-600">
                  You will be redirected to Paystack's secure payment page to complete your transaction.
                </p>
              </motion.div>
            )}

            {/* Mobile Money Form */}
            {paymentMethod === 'mobile_money' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="network" className="text-sm font-medium">Mobile Money Network</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose your network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                      <SelectItem value="vod">Vodafone Cash</SelectItem>
                      <SelectItem value="tgo">AirtelTigo Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mobile_number" className="text-sm font-medium">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    type="tel"
                    placeholder="0XX XXX XXXX"
                    value={mobileNumber.startsWith('233') ? '0' + mobileNumber.substring(3) : mobileNumber}
                    onChange={(e) => {
                      // Format phone number to ensure it starts with country code
                      let phone = e.target.value.replace(/\D/g, '');
                      if (phone.startsWith('0')) {
                        phone = '233' + phone.substring(1);
                      } else if (!phone.startsWith('233')) {
                        phone = '233' + phone;
                      }
                      setMobileNumber(phone);
                    }}
                    className="mt-1"
                  />
                </div>
              </motion.div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
              <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment is processed securely by Paystack with 256-bit SSL encryption.</p>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={initializePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Pay GH₵ {amount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Return Guide */}
      <PaymentReturnGuide
        isVisible={showReturnGuide}
        onClose={() => {
          setShowReturnGuide(false);
          // Still redirect if they close the guide
          if (paymentMethod === 'mobile_money') {
            const storedReference = localStorage.getItem('pending_payment_reference');
            if (storedReference) {
              window.location.href = window.location.origin + '/payment/redirect?ref=' + storedReference;
            }
          }
        }}
      />
    </>
  );
};