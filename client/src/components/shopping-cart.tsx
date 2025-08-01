import { useState } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCart } from '@/contexts/cart-context';
import { CheckoutModal } from './checkout-modal';

export const ShoppingCartModal = () => {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const deliveryFee = 25;
  const total = getTotal() + deliveryFee;

  if (showCheckout) {
    return (
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={items}
        total={total}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {getItemCount() > 0 && (
            <span className="absolute -top-1 -right-1 btn-orange-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getItemCount()}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Shopping Cart</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <>
              {items.map((item) => (
                <Card key={item.product.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.image_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80"}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-black">{item.product.title}</h4>
                        <p className="text-sm text-gray-600">by Vendor</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-orange-500">
                            ₵{parseFloat(item.product.price).toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₵{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">₵{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-orange-500">₵{total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full btn-orange-primary"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
