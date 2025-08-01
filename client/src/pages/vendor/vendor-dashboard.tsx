import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  Star,
  Clock,
  Eye,
  BarChart3,
  Calendar,
  Activity,
  Zap,
  Sparkles,
  Settings,
  Plus,
  MessageSquare,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface VendorStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  pendingPayouts: number;
}

interface RecentOrder {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  buyer_name?: string;
}

export default function VendorDashboard() {
  const { user, token } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [animationKey, setAnimationKey] = useState(0);

  const { data: stats, isLoading: statsLoading } = useQuery<VendorStats>({
    queryKey: ['/api/vendors', user?.id, 'stats'],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${user?.id}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    enabled: !!user?.id && !!token
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery<RecentOrder[]>({
    queryKey: ['/api/orders', 'vendor', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders?vendor=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orders = await response.json();
      return orders.slice(0, 5);
    },
    enabled: !!user?.id && !!token
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/products?vendor=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    enabled: !!user?.id && !!token
  });

  const { data: recentPayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/vendors', user?.id, 'payments'],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${user?.id}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payments = await response.json();
      return payments.slice(0, 5);
    },
    enabled: !!user?.id && !!token
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['/api/vendors', user?.id, 'payouts'],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${user?.id}/payouts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    enabled: !!user?.id && !!token
  });

  // Trigger animation when stats change
  useEffect(() => {
    if (stats) {
      setAnimationKey(prev => prev + 1);
    }
  }, [stats]);

  const statCards = [
    {
      title: "Total Sales",
      value: stats?.totalSales || 0,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      prefix: "₵",
      trend: "+12.5%",
      description: "vs last month",
      trendUp: true
    },
    {
      title: "Total Orders", 
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+8.3%",
      description: "vs last month",
      trendUp: true
    },
    {
      title: "Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "+2",
      description: "new this month",
      trendUp: true
    },
    {
      title: "Pending Payouts",
      value: stats?.pendingPayouts || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      prefix: "₵",
      description: "awaiting processing",
      trendUp: false
    }
  ];

  const quickActions = [
    { title: "Add Product", icon: Plus, color: "text-blue-600", bgColor: "bg-blue-100", href: "/vendor/products" },
    { title: "View Orders", icon: MessageSquare, color: "text-green-600", bgColor: "bg-green-100", href: "/vendor/orders" },
    { title: "Cart Dashboard", icon: ShoppingBag, color: "text-purple-600", bgColor: "bg-purple-100", href: "/cart-dashboard" },
    { title: "Analytics", icon: BarChart3, color: "text-indigo-600", bgColor: "bg-indigo-100", href: "/vendor/analytics" },
    { title: "Settings", icon: Settings, color: "text-orange-600", bgColor: "bg-orange-100", href: "/vendor/settings" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-ktu-grey py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ktu-grey py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-ktu-deep-blue mb-2">
              Welcome back, {user?.business_name || user?.full_name}! 
              <motion.span
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block ml-2"
              >
                👋
              </motion.span>
            </h1>
            <p className="text-ktu-dark-grey">Manage your KTU student business and track your entrepreneurial journey</p>
          </div>
        </motion.div>

        {/* My Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center text-lg">
                  <Package className="w-5 h-5 mr-2 text-gray-700" />
                  My Products
                </span>
                <Link to="/vendor/products/grid">
                  <Button variant="outline" size="sm" className="text-ktu-deep-blue hover:text-ktu-orange">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products yet</p>
                  <p className="text-sm text-gray-400 mb-4">Add your first product to start selling</p>
                  <Link to="/vendor/products">
                    <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {products.slice(0, 5).map((product: any, index: number) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-2 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.title}</p>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {product.status}
                          </Badge>
                          <span className="font-semibold text-gray-900">₵{product.price}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* KTU Student Business Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-ktu-deep-blue">
                <Plus className="w-5 h-5 mr-2 text-ktu-orange" />
                Business Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/vendor/products">
                <Button className="w-full bg-ktu-orange hover:bg-ktu-orange-light text-white justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
              </Link>
              <Link to="/mentorship">
                <Button variant="outline" className="w-full justify-start text-ktu-deep-blue hover:text-ktu-orange">
                  <Users className="w-4 h-4 mr-2" />
                  Find Mentors
                </Button>
              </Link>
              <Link to="/resources">
                <Button variant="outline" className="w-full justify-start text-ktu-deep-blue hover:text-ktu-orange">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Business Resources
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-ktu-deep-blue">
                <MessageSquare className="w-5 h-5 mr-2 text-ktu-orange" />
                Connect & Learn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/community">
                <Button variant="outline" className="w-full justify-start text-ktu-deep-blue hover:text-ktu-orange">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Community Forum
                </Button>
              </Link>
              <Link to="/businesses">
                <Button variant="outline" className="w-full justify-start text-ktu-deep-blue hover:text-ktu-orange">
                  <Package className="w-4 h-4 mr-2" />
                  Other Student Businesses
                </Button>
              </Link>
              <Link to="/vendor/settings">
                <Button variant="outline" className="w-full justify-start text-ktu-deep-blue hover:text-ktu-orange">
                  <Settings className="w-4 h-4 mr-2" />
                  Business Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          
        </motion.div>
      </div>
    </div>
  );
}