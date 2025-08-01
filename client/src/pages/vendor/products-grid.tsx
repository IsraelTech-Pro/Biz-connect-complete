import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  ArrowLeft,
  Package,
  Eye,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@shared/schema';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Beauty', label: 'Beauty' },
  { value: 'Home & Kitchen', label: 'Home & Kitchen' },
  { value: 'Food & Beverages', label: 'Food & Beverages' },
  { value: 'Toys & Hobbies', label: 'Toys & Hobbies' },
  { value: 'Pet Products', label: 'Pet Products' },
  { value: 'Digital Products', label: 'Digital Products' },
  { value: 'Health & Wellness', label: 'Health & Wellness' },
  { value: 'DIY & Hardware', label: 'DIY & Hardware' },
  { value: 'Other Categories', label: 'Other Categories' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' }
];

export default function VendorProductsGrid() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/products?vendor=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    enabled: !!user?.id && !!token
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive"
      });
    }
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      case 'stock-low':
        return (a.stock_quantity || 0) - (b.stock_quantity || 0);
      case 'stock-high':
        return (b.stock_quantity || 0) - (a.stock_quantity || 0);
      case 'newest':
      default:
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
  });

  const handleDelete = (productId: string, productTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/vendor/dashboard">
                <Button variant="outline" className="text-gray-600 hover:text-gray-900 border-gray-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                <p className="text-gray-600 mt-1">
                  Manage your product catalog ({products.length} products)
                </p>
              </div>
            </div>
            <Link href="/vendor/products">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="stock-low">Stock: Low to High</SelectItem>
                    <SelectItem value="stock-high">Stock: High to Low</SelectItem>
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

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {sortedProducts.length} of {products.length} products
                </span>
                <div className="flex items-center space-x-4">
                  <span>Active: {products.filter(p => p.status === 'active').length}</span>
                  <span>Inactive: {products.filter(p => p.status === 'inactive').length}</span>
                  <span>Draft: {products.filter(p => p.status === 'draft').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Grid/List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : sortedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {products.length === 0 ? 'No products yet' : 'No products match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0 
                  ? 'Start building your product catalog to grow your business'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {products.length === 0 && (
                <Link href="/vendor/products">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group relative"
                >
                  <ProductCard product={product} />
                  
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex flex-col space-y-1">
                      <Link href={`/vendor/products?edit=${product.id}`}>
                        <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="w-8 h-8 p-0"
                        onClick={() => handleDelete(product.id, product.title)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product.image_url || "/api/placeholder/80/80"} 
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{product.title}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {product.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-lg font-bold text-gray-900">
                                  ₵{product.price}
                                </span>
                                <Badge className={getStatusColor(product.status)}>
                                  {product.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Stock: {product.stock_quantity || 0}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link href={`/products/${product.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Link href={`/vendor/products?edit=${product.id}`}>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(product.id, product.title)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}