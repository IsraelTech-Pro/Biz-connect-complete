import { useState } from 'react';
import { Link } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import { CheckoutModal } from '@/components/checkout-modal';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started</p>
            <Link href="/products">
              <Button className="btn-orange-primary">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black">Shopping Cart</h1>
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200"}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">{product.title}</h3>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <p className="text-lg font-bold text-orange-500 mt-2">
                        ₵{parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(product.id, quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(product.id, quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span>{product.title} x{quantity}</span>
                      <span>₵{(parseFloat(product.price) * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-orange-500">₵{getTotal().toFixed(2)}</span>
                </div>
                <Button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full btn-orange-primary"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items}
        total={getTotal()}
      />
    </div>
  );
}