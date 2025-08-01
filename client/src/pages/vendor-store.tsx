import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Store, Filter, Grid, List, Search, Phone, Mail, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from '@/components/product-card';
import { Separator } from '@/components/ui/separator';
import type { User, Product } from '@shared/schema';

export default function VendorStore() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');

  const { data: vendor, isLoading: vendorLoading } = useQuery<User>({
    queryKey: ['/api/users', vendorId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${vendorId}`);
      if (!response.ok) throw new Error('Vendor not found');
      return response.json();
    },
    enabled: !!vendorId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', 'vendor', vendorId],
    queryFn: async () => {
      const response = await fetch(`/api/products?vendor=${vendorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!vendorId,
  });

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
      default:
        return a.title.localeCompare(b.title);
    }
  });

  if (vendorLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-64 bg-gradient-to-r from-orange-400 to-orange-600 shimmer"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg shimmer"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Vendor not found</h1>
          <p className="text-gray-600">The vendor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="h-64 bg-gradient-to-r from-orange-400 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white animate-slide-in">
            <h1 className="text-4xl font-bold mb-2">{vendor.business_name || vendor.full_name}</h1>
            <p className="text-xl opacity-90 mb-4">{vendor.business_description || 'Quality products and excellent service'}</p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold">4.8</span>
                <span className="opacity-75">(156 reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-5 w-5" />
                <span>Accra, Ghana</span>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {products.length} products
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Store Info */}
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-orange-500" />
                    <span>Store Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{vendor.phone || '+233 XXX XXX XXX'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{vendor.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Mon-Sat: 8AM-6PM</span>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Verified Vendor</span>
                  </div>
                </CardContent>
              </Card>

              {/* Store Stats */}
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle>Store Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Products</span>
                    <span className="font-semibold">{products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Store Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">4.8</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold">&lt; 1 hour</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card className="animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Grid */}
              <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                  <TabsTrigger value="about">About Store</TabsTrigger>
                </TabsList>
                
                <TabsContent value="products" className="mt-6">
                  {sortedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {sortedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="about" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {vendor.business_name || vendor.full_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        {vendor.business_description || 'This vendor provides quality products with excellent customer service. We are committed to delivering the best shopping experience for our customers.'}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Store Policies</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Free delivery on orders over ₵100</li>
                            <li>• 7-day return policy</li>
                            <li>• Secure payment options</li>
                            <li>• Quality guarantee</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Contact Information</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Email: {vendor.email}</li>
                            <li>• Phone: {vendor.phone || '+233 XXX XXX XXX'}</li>
                            <li>• Location: Accra, Ghana</li>
                            <li>• Response time: Usually within 1 hour</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}