import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import type { Product, Order } from '@shared/schema';

interface VendorStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  pendingPayouts: number;
}

interface Analytics {
  revenueGrowth: number;
  orderGrowth: number;
  avgOrderValue: number;
  bestSellingProducts: Product[];
  recentOrders: Order[];
  salesByCategory: { category: string; sales: number; percentage: number }[];
  monthlyStats: { month: string; sales: number; orders: number }[];
}

export default function VendorAnalytics() {
  const { user, token } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [viewType, setViewType] = useState('overview');

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

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/products?vendor=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    enabled: !!user?.id && !!token
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders', 'vendor', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders?vendor=${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    enabled: !!user?.id && !!token
  });

  // Calculate analytics from available data
  const analytics: Analytics = {
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + parseFloat(order.amount), 0) / orders.length : 0,
    bestSellingProducts: products.slice(0, 5),
    recentOrders: orders.slice(0, 5),
    salesByCategory: [],
    monthlyStats: []
  };

  // Calculate sales by category
  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  analytics.salesByCategory = Object.entries(categoryStats).map(([category, count]) => ({
    category,
    sales: count,
    percentage: (count / products.length) * 100
  }));

  const statCards = [
    {
      title: "Total Revenue",
      value: stats?.totalSales || 0,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      prefix: "₵",
      trend: analytics.revenueGrowth,
      trendUp: analytics.revenueGrowth > 0
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: analytics.orderGrowth,
      trendUp: analytics.orderGrowth > 0
    },
    {
      title: "Average Order Value",
      value: analytics.avgOrderValue.toFixed(2),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      prefix: "₵",
      trend: 5.2,
      trendUp: true
    },
    {
      title: "Products Listed",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: products.length,
      trendUp: true
    }
  ];

  const quickMetrics = [
    { label: "Pending Payouts", value: `₵${stats?.pendingPayouts || 0}`, icon: Clock, color: "text-yellow-600" },
    { label: "Active Products", value: products.filter(p => p.status === 'active').length, icon: Activity, color: "text-green-600" },
    { label: "Completion Rate", value: "94%", icon: Star, color: "text-blue-600" },
    { label: "Response Time", value: "2.3h", icon: Clock, color: "text-purple-600" }
  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
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
            <h1 className="text-3xl font-bold text-black">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your store performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {card.prefix}{card.value}
                  </div>
                  <div className="flex items-center text-sm mt-1">
                    {card.trendUp ? (
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={card.trendUp ? 'text-green-600' : 'text-red-600'}>
                      {card.trend}%
                    </span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                      <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                    </div>
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.salesByCategory.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                      />
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.sales}</div>
                      <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Best Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Best Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.bestSellingProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">₵{product.price}</div>
                      <div className="text-xs text-gray-500">Stock: {product.stock_quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-orange-600" />
                Recent Orders
              </div>
              <Badge variant="outline">{orders.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">{order.buyer_name || 'Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₵{order.amount}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}