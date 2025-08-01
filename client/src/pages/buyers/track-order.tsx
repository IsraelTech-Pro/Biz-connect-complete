import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@shared/schema';

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Pending Payment'
  },
  processing: {
    icon: Package,
    color: 'bg-blue-100 text-blue-800',
    label: 'Processing'
  },
  shipped: {
    icon: Truck,
    color: 'bg-purple-100 text-purple-800',
    label: 'Shipped'
  },
  delivered: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    label: 'Delivered'
  },
  cancelled: {
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800',
    label: 'Cancelled'
  }
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [searchMode, setSearchMode] = useState<'id' | 'email'>('id');
  
  const { data: order, isLoading, error, refetch } = useQuery<Order>({
    queryKey: ['/api/orders', orderId],
    enabled: false,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders/by-email', email],
    enabled: false,
  });

  const handleSearch = () => {
    if (searchMode === 'id' && orderId) {
      refetch();
    } else if (searchMode === 'email' && email) {
      // This would need to be implemented in the backend
      console.log('Search by email:', email);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status) + 1;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-black mb-4">
              Track Your <span className="text-gradient">Order</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enter your order ID or email address to track your order status
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8 animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Track Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={searchMode === 'id' ? 'default' : 'outline'}
                  onClick={() => setSearchMode('id')}
                  className="flex-1"
                >
                  Search by Order ID
                </Button>
                <Button
                  variant={searchMode === 'email' ? 'default' : 'outline'}
                  onClick={() => setSearchMode('email')}
                  className="flex-1"
                >
                  Search by Email
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                {searchMode === 'id' ? (
                  <Input
                    type="text"
                    placeholder="Enter your order ID (e.g., ORD-123456)"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="flex-1"
                  />
                ) : (
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                )}
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading || (searchMode === 'id' ? !orderId : !email)}
                  className="gradient-bg text-white"
                >
                  {isLoading ? 'Searching...' : 'Track Order'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Results */}
        {order && (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id}</CardTitle>
                  <p className="text-gray-600 mt-1">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <Badge className={statusConfig[order.status]?.color}>
                  {statusConfig[order.status]?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Order Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Order Progress</span>
                  <span className="text-sm text-gray-600">
                    Step {getStatusStep(order.status)} of 4
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="gradient-bg h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(getStatusStep(order.status) / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Order ID:</span>
                      <span className="font-medium">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium">{statusConfig[order.status]?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-medium">{order.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">GHS {order.amount}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium">{order.buyer_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">{order.buyer_phone}</span>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium">Address:</span>
                      <p className="text-gray-600 mt-1">{order.delivery_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    const isActive = status === order.status;
                    const isPast = getStatusStep(status) <= getStatusStep(order.status);
                    
                    return (
                      <div key={status} className={`flex items-center gap-3 ${
                        isPast ? 'text-black' : 'text-gray-400'
                      }`}>
                        <div className={`p-2 rounded-full ${
                          isActive ? 'btn-orange-primary text-white' : 
                          isPast ? 'bg-green-500 text-white' : 'bg-gray-200'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{config.label}</div>
                          {isActive && (
                            <div className="text-sm text-gray-600">
                              Updated on {formatDate(order.created_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="animate-fade-in">
            <CardContent className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find an order with that ID. Please check your order ID and try again.
              </p>
              <Button onClick={() => setOrderId('')} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Can't find your order?</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Check your email for the order confirmation. The order ID is usually in the subject line.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Questions about delivery?</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Contact our support team for help with delivery issues or questions.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="mr-2">
                Contact Support
              </Button>
              <Button variant="outline">
                View Return Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}