import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Calendar,
  Clock,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import type { Order } from '@shared/schema';

export default function VendorOrders() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch product details for the selected order
  const { data: productDetails } = useQuery({
    queryKey: ['/api/products', selectedOrder?.product_id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${selectedOrder?.product_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      return response.json();
    },
    enabled: !!selectedOrder?.product_id && !!token
  });

  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders', 'vendor', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders?vendor=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const ordersData = await response.json();
      
      // Fetch product details for each order
      const ordersWithProducts = await Promise.all(
        ordersData.map(async (order: Order) => {
          if (order.product_id) {
            try {
              const productResponse = await fetch(`/api/products/${order.product_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (productResponse.ok) {
                const product = await productResponse.json();
                return { ...order, product };
              }
            } catch (error) {
              console.error('Failed to fetch product for order:', order.id, error);
            }
          }
          return order;
        })
      );
      
      return ordersWithProducts;
    },
    enabled: !!user?.id && !!token
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, updated_at: new Date().toISOString() })
      });
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status.",
        variant: "destructive"
      });
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'shipped': return <Package className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus });
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error loading orders</h3>
            <p className="text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/vendor/dashboard">
                <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-black">My Orders</h1>
            <p className="text-gray-600 mt-2">Manage your customer orders</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              Total: {orders.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Pending: {orders.filter(o => o.status === 'pending').length}
            </Badge>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, customer name, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Orders will appear here when customers purchase your products'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div>
                            <CardTitle className="text-lg font-semibold">
                              Order #{order.id.substring(0, 8)}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Customer</span>
                          </div>
                          <p className="text-sm text-gray-600">{order.buyer_name || order.users?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{order.buyer_email || order.users?.email || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{order.buyer_phone || order.users?.phone || order.phone || 'N/A'}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Delivery Address</span>
                          </div>
                          <p className="text-sm text-gray-600">{order.delivery_address || order.shipping_address || 'N/A'}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Order Total</span>
                          </div>
                          <p className="text-lg font-bold text-green-600">₵{order.amount || order.total_amount}</p>
                          {order.product && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {order.product.image_url ? (
                                  <img 
                                    src={order.product.image_url} 
                                    alt={order.product.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{order.product.title}</p>
                                <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'processing')}
                              disabled={updateOrderMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Accept Order
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'shipped')}
                              disabled={updateOrderMutation.isPending}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Mark as Shipped
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'completed')}
                              disabled={updateOrderMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark as Completed
                            </Button>
                          )}
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              disabled={updateOrderMutation.isPending}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Order Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                View complete order information and customer details.
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                      <p><span className="font-medium">Amount:</span> ₵{selectedOrder.total_amount}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedOrder.buyer_name || selectedOrder.users?.full_name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.buyer_email || selectedOrder.users?.email || 'N/A'}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.buyer_phone || selectedOrder.users?.phone || selectedOrder.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedOrder.shipping_address || 'No delivery address provided'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {productDetails ? (
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {productDetails.image_url ? (
                            <img 
                              src={productDetails.image_url} 
                              alt={productDetails.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{productDetails.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{productDetails.description?.substring(0, 100)}...</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">Quantity: {selectedOrder.quantity}</span>
                              <span className="text-sm font-medium text-gray-900">₵{productDetails.price}</span>
                            </div>
                            <Link to={`/products/${productDetails.id}`}>
                              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>View Item</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Package className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Loading product details...</p>
                          <p className="text-xs text-gray-500">Product ID: {selectedOrder?.product_id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}