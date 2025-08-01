import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Package,
  DollarSign,
  Calendar,
  User,
  Trash2,
  Plus,
  Minus,
  Star,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  ShoppingBag,
  Heart,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface Order {
  id: string;
  buyer_id: string;
  vendor_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  vendor_name?: string;
  vendor_email?: string;
  vendor_phone?: string;
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    rating_average: number;
    rating_count: number;
  };
}

interface CartStats {
  totalItems: number;
  totalValue: number;
  uniqueVendors: number;
  avgOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export default function CartDashboard() {
  const { user, token } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  // Fetch user's orders as both buyer and vendor
  const { data: buyerOrders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders', 'buyer', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders?buyer=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch buyer orders');
      return response.json();
    },
    enabled: !!user?.id && !!token
  });

  const { data: vendorOrders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders', 'vendor', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders?vendor=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch vendor orders');
      return response.json();
    },
    enabled: !!user?.id && !!token && (user?.role === 'vendor' || user?.role === 'admin')
  });

  // Combine all orders
  const allOrders = [...buyerOrders, ...vendorOrders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Filter orders based on search and filters
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeFilter) {
        case '7d': matchesTime = daysDiff <= 7; break;
        case '30d': matchesTime = daysDiff <= 30; break;
        case '90d': matchesTime = daysDiff <= 90; break;
        default: matchesTime = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });

  // Calculate cart statistics
  const cartStats: CartStats = {
    totalItems: cart.length,
    totalValue: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    uniqueVendors: new Set(cart.map(item => item.vendor_id)).size,
    avgOrderValue: allOrders.length > 0 ? allOrders.reduce((sum, order) => sum + order.total_amount, 0) / allOrders.length : 0,
    completedOrders: allOrders.filter(order => order.status === 'completed').length,
    pendingOrders: allOrders.filter(order => order.status === 'pending').length,
    cancelledOrders: allOrders.filter(order => order.status === 'cancelled').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'confirmed': return <CheckCircle className="w-3 h-3" />;
      case 'processing': return <Clock className="w-3 h-3" />;
      case 'pending': return <AlertCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      default: return <Package className="w-3 h-3" />;
    }
  };

  const getOrderType = (order: Order) => {
    return order.buyer_id === user?.id ? 'Purchase' : 'Sale';
  };

  const getOrderTypeColor = (order: Order) => {
    return order.buyer_id === user?.id ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
                <span>Cart Dashboard</span>
              </h1>
              <p className="text-gray-600 mt-1">Manage your cart and view order history</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Cart</p>
                <p className="text-lg font-semibold text-orange-600">{cartStats.totalItems} items</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Cart Value</p>
                <p className="text-lg font-semibold text-green-600">₵{cartStats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{cartStats.completedOrders}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{cartStats.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">₵{cartStats.avgOrderValue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Cart */}
        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Current Cart</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearCart()}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear Cart
                </Button>
                <Link to="/checkout">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">₵{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₵{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, product, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order History</h2>
          
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || timeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Your order history will appear here'
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
                  >
                    <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {order.product?.image_url ? (
                                <img 
                                  src={order.product.image_url} 
                                  alt={order.product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                                <span>{order.product?.title || 'Product'}</span>
                                <Badge variant="outline" className={getOrderTypeColor(order)}>
                                  {getOrderType(order)}
                                </Badge>
                                {order.product_id && (
                                  <Link to={`/products/${order.product_id}`}>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </Link>
                                )}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-500">
                                  Order #{order.id.substring(0, 8)}
                                </span>
                                <span className="text-sm text-gray-400">•</span>
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
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">Amount</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              ₵{order.total_amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {order.quantity}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {getOrderType(order) === 'Purchase' ? 'Vendor' : 'Customer'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {getOrderType(order) === 'Purchase' 
                                ? order.vendor_name || 'N/A'
                                : order.buyer_name || 'N/A'
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              {getOrderType(order) === 'Purchase' 
                                ? order.vendor_email || order.vendor_phone || 'N/A'
                                : order.buyer_email || order.buyer_phone || 'N/A'
                              }
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">Order Date</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                            {order.product && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-500">
                                  {order.product.rating_average} ({order.product.rating_count} reviews)
                                </span>
                              </div>
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
        </div>
      </div>
    </div>
  );
}