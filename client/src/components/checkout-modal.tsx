import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { PaymentModal } from './payment-modal';
import { CreditCard, Truck, Phone, MessageCircle, ShoppingBag, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import type { Product } from '@shared/schema';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{ product: Product; quantity: number }>;
  total: number;
}

export const CheckoutModal = ({ isOpen, onClose, items, total }: CheckoutModalProps) => {
  const [step, setStep] = useState<'options' | 'payment' | 'delivery'>('options');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'card'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<{ phone: string; whatsapp: string; business_name: string } | null>(null);
  const { clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchVendorInfo = async () => {
    if (items.length === 0) return;
    
    // Get vendor info for the first item (assuming single vendor checkout)
    const vendorId = items[0].product.vendor_id;
    try {
      const response = await fetch(`/api/users/${vendorId}`);
      if (response.ok) {
        const vendor = await response.json();
        setVendorInfo({
          phone: vendor.phone || '',
          whatsapp: vendor.whatsapp || '',
          business_name: vendor.business_name || 'Vendor'
        });
      }
    } catch (error) {
      console.error('Error fetching vendor info:', error);
    }
  };

  const handlePayOnlineOption = () => {
    setStep('payment');
  };

  const handleDeliveryOption = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to place an order.",
        variant: "destructive"
      });
      return;
    }

    await fetchVendorInfo();
    
    // Create delivery orders immediately
    try {
      for (const item of items) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            buyer_id: user.id,
            vendor_id: item.product.vendor_id,
            product_id: item.product.id,
            quantity: item.quantity,
            amount: (parseFloat(item.product.price) * item.quantity).toString(),
            payment_type: 'delivery',
            buyer_email: user.email,
            buyer_phone: user.phone || 'TBC',
            buyer_name: user.full_name,
            delivery_address: user.address || 'To be arranged',
            status: 'pending'
          })
        });
      }
      
      // Store cart items in localStorage with special key before clearing
      localStorage.setItem('deliveryItems', JSON.stringify(items));
      
      clearCart();
      toast({
        title: "Delivery Request Created!",
        description: "Redirecting to vendor contact page...",
      });
      
      // Close modal and redirect to contact vendor page
      onClose();
      const vendorId = items[0].product.vendor_id;
      setLocation(`/contact-vendor/${vendorId}`);
    } catch (error) {
      console.error('Delivery order creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create delivery order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your order.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Store checkout data in localStorage for mobile money callback
      localStorage.setItem('checkout_phone', formData.phone);
      localStorage.setItem('checkout_address', formData.address);
      localStorage.setItem('cart', JSON.stringify(items));
      
      // Create orders for each item
      for (const item of items) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            buyer_id: user.id,
            vendor_id: item.product.vendor_id,
            product_id: item.product.id,
            quantity: item.quantity,
            amount: (parseFloat(item.product.price) * item.quantity).toString(),
            payment_id: reference,
            payment_type: 'online',
            buyer_email: formData.email,
            buyer_phone: formData.phone,
            buyer_name: formData.name,
            delivery_address: formData.address,
            status: 'pending'
          })
        });
      }
      
      clearCart();
      setShowPaymentModal(false);
      onClose();
      
      // Clear stored checkout data after successful order creation
      localStorage.removeItem('checkout_phone');
      localStorage.removeItem('checkout_address');
      localStorage.removeItem('cart');
      
      toast({
        title: "Order Successful!",
        description: "Your order has been placed successfully.",
      });
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Failed",
        description: "Payment successful but order creation failed. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset step when modal closes
  const handleClose = () => {
    setStep('options');
    setVendorInfo(null);
    onClose();
  };

  const renderCheckoutOptions = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.1
          }}
        >
          <ShoppingBag className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-black mb-2">Checkout Options</h3>
        <p className="text-gray-600">Choose your preferred payment method</p>
      </motion.div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handlePayOnlineOption}
            className="w-full h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <CreditCard className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-bold">Pay Online Now</div>
              <div className="text-sm opacity-90">Card / Mobile Money</div>
            </div>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleDeliveryOption}
            className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Truck className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-bold">Arrange Delivery</div>
              <div className="text-sm opacity-90">Pay on Delivery/Pickup</div>
            </div>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderDeliveryOption = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Success Animation */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.2
          }}
          className="relative mx-auto mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 w-20 h-20 bg-orange-400 rounded-full opacity-30"
          />
        </motion.div>
        
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4"
        >
          Delivery Request Sent!
        </motion.h3>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
        >
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-orange-500 mr-2" />
            <span className="font-semibold text-orange-800">What happens next?</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {vendorInfo?.business_name || 'Our vendor'} will contact you within 24 hours on{' '}
            <span className="font-bold text-orange-600">{vendorInfo?.phone || '055 103 5300'}</span>{' '}
            to arrange delivery and payment details.
          </p>
        </motion.div>
      </div>

      {/* Contact Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 font-medium">Need immediate assistance?</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => window.open(`tel:${vendorInfo?.phone || '055 103 5300'}`)}
            className="h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Phone className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Call Now</div>
              <div className="text-xs opacity-90">Direct line</div>
            </div>
          </Button>

          <Button
            onClick={() => window.open(`https://wa.me/${vendorInfo?.whatsapp?.replace(/[^0-9]/g, '') || '0551035300'}`)}
            className="h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">WhatsApp</div>
              <div className="text-xs opacity-90">Chat now</div>
            </div>
          </Button>
        </div>
      </motion.div>

      {/* Bottom Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="text-center pt-6 border-t border-gray-200"
      >
        <Button
          onClick={handleClose}
          variant="outline"
          className="text-orange-500 border-orange-500 hover:bg-orange-50 px-8 h-12 font-semibold"
        >
          Continue Shopping
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          Order ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </motion.div>
    </motion.div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button
          onClick={() => setStep('options')}
          variant="ghost"
          className="p-2 h-8 w-8 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-xl font-bold text-black ml-2">Secure Checkout</h3>
      </div>

      {/* Order Summary */}
      <Card className="bg-orange-50">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between">
              <span>{item.product.title} (x{item.quantity})</span>
              <span>₵{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>₵25.00</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-orange-500">₵{total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0XX XXX XXXX"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="address">Delivery Address *</Label>
          <Textarea
            id="address"
            placeholder="Enter your delivery address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          `Pay ₵${total.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment will be processed securely through Paystack
      </p>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div>
                <p className="text-gray-600">Powered by Paystack</p>
              </div>
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              {step === 'options' && 'Choose your preferred payment method'}
              {step === 'payment' && 'Complete your secure checkout'}
              {step === 'delivery' && 'Your delivery request has been processed'}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {step === 'options' && renderCheckoutOptions()}
              {step === 'payment' && renderPaymentForm()}
              {step === 'delivery' && renderDeliveryOption()}
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={total}
        email={formData.email}
        onSuccess={handlePaymentSuccess}
        orderData={{
          items,
          deliveryInfo: {
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          }
        }}
      />
    </>
  );
};