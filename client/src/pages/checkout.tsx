import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { initializePaystackPayment } from '@/lib/paystack';
import { apiRequest } from '@/lib/queryClient';

const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(10, 'Complete address is required'),
  city: z.string().min(2, 'City is required'),
  region: z.string().min(2, 'Region is required'),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      region: '',
      notes: '',
    },
  });

  const handlePayment = async (data: CheckoutForm) => {
    setIsProcessing(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        delivery_info: data,
        total_amount: getTotal(),
      };

      // Initialize Paystack payment
      initializePaystackPayment({
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
        email: data.email,
        amount: getTotal(), // Amount will be converted to kobo in the function
        currency: 'GHS',
        callback: async (response) => {
          try {
            // Verify payment and create order
            const result = await apiRequest('/api/orders', {
              method: 'POST',
              body: JSON.stringify({
                ...orderData,
                paystack_reference: response.reference,
                payment_status: 'completed',
              }),
            });

            if (result.success) {
              clearCart();
              toast({
                title: 'Order placed successfully!',
                description: 'You will receive a confirmation email shortly.',
              });
              // Redirect to order confirmation page
              window.location.href = '/orders';
            }
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to process order. Please contact support.',
              variant: 'destructive',
            });
          }
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-black mb-4">No items to checkout</h2>
            <p className="text-gray-600">Add some products to your cart first</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-black mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Delivery Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+233 123 456 789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="123 Main Street, House Number, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Accra" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <FormControl>
                              <Input placeholder="Greater Accra" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Special instructions for delivery..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.title}</p>
                        <p className="text-sm text-gray-600">Qty: {quantity}</p>
                      </div>
                      <p className="font-medium">₵{(parseFloat(product.price) * quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₵{getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-500">₵{getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={form.handleSubmit(handlePayment)}
                  disabled={isProcessing}
                  className="w-full btn-orange-primary"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Pay with Paystack'}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Secure payment powered by Paystack. Supports Cards & Mobile Money.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}