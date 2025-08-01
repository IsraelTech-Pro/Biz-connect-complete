import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';

export default function Orders() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders/buyer', user?.id],
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Please login to view your orders</p>
            <Button onClick={() => setLocation('/auth/login')} className="btn-orange-primary">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            onClick={() => setLocation('/')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
              <Button onClick={() => setLocation('/')} className="btn-orange-primary">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">GH₵{parseFloat(order.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment:</span>
                          <span className="font-medium capitalize">{order.payment_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">{order.quantity}</span>
                        </div>
                        {order.payment_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment ID:</span>
                            <span className="font-medium text-xs">{order.payment_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Delivery Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium ml-2">{order.buyer_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium ml-2">{order.buyer_email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium ml-2">{order.buyer_phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium ml-2">{order.delivery_address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {order.status === 'pending' && order.payment_type === 'delivery' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Next Steps:</strong> The vendor will contact you to arrange delivery and payment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}