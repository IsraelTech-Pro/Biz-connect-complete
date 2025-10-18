import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  Search, Filter, Grid, List, Star, Heart, Eye, ShoppingCart,
  SlidersHorizontal, ArrowUpDown, ChevronDown, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import type { Product } from '@shared/schema';
import { ProductRating } from '@/components/product-rating';

const ProductCard = ({ product, index }: { product: any; index: number }) => {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      <Link href={`/products/${product.id}`}>
        <Card className="ktu-card animate-card-lift h-full group cursor-pointer">
          <div className="relative overflow-hidden">
            <img 
              src={product.image || `https://images.unsplash.com/photo-152327533568${product.id}?w=300&h=250&fit=crop`} 
              alt={product.name}
              className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2">
              <span className="bg-ktu-orange text-white text-xs px-2 py-1 rounded font-medium">
                ₵{product.price}
              </span>
            </div>
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
                className={`p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors ${
                  isLiked ? 'text-red-500' : 'text-ktu-dark-grey'
                }`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors text-ktu-dark-grey">
                <Eye className="h-3 w-3" />
              </button>
            </div>
            
          </div>
          
          <CardContent className="p-3">
            <div className="mb-2">
              <span className="text-xs text-ktu-orange font-medium">{product.business}</span>
            </div>
            <h3 className="font-medium text-ktu-deep-blue text-sm mb-1 line-clamp-1 group-hover:text-ktu-orange transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-ktu-dark-grey line-clamp-2 mb-2">
              {product.description}
            </p>
            
            <ProductRating 
              productId={product.id} 
              size="sm" 
              showCount={true} 
              interactive={true}
            />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function ProductsListing() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');

  // Handle URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location]);

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'tech', label: 'Tech Accessories' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'food', label: 'Food & Snacks' },
    { value: 'books', label: 'Books & Stationery' },
    { value: 'art', label: 'Art & Crafts' },
    { value: 'services', label: 'Services' },
    { value: 'beauty', label: 'Beauty & Care' },
    { value: 'sports', label: 'Sports & Fitness' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Price ranges
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-20', label: 'Under ₵20' },
    { value: '20-50', label: '₵20 - ₵50' },
    { value: '50-100', label: '₵50 - ₵100' },
    { value: '100-200', label: '₵100 - ₵200' },
    { value: '200+', label: '₵200+' }
  ];

  // Transform products data from database
  const transformedProducts = products.map(product => ({
    id: product.id,
    name: product.title,
    description: product.description,
    price: parseFloat(product.price).toFixed(2),
    business: product.brand || "KTU Vendor",
    category: product.category,
    image: product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=250&fit=crop",
    rating: parseFloat(product.rating_average || "4.5"),
    reviews: product.rating_count || 10,
    stock: product.stock_quantity,
    created_at: product.created_at
  }));

  // Use only real data from database
  const sampleProducts = transformedProducts;

  // Filter products based on criteria
  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.business.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                          product.category.toLowerCase().includes(selectedCategory);
    
    const price = parseFloat(product.price);
    let matchesPrice = true;
    if (priceRange !== 'all') {
      if (priceRange === '0-20') matchesPrice = price < 20;
      else if (priceRange === '20-50') matchesPrice = price >= 20 && price < 50;
      else if (priceRange === '50-100') matchesPrice = price >= 50 && price < 100;
      else if (priceRange === '100-200') matchesPrice = price >= 100 && price < 200;
      else if (priceRange === '200+') matchesPrice = price >= 200;
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      case 'oldest':
        return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.reviews - a.reviews;
      default:
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
  });

  return (
    <div className="min-h-screen bg-ktu-grey">
      {/* Header Section */}
      <section className="bg-white border-b border-ktu-light-blue">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-ktu-deep-blue mb-2">
              Student Products Marketplace
            </h1>
            <p className="text-ktu-dark-grey max-w-2xl mx-auto">
              Discover amazing products created and sold by KTU student entrepreneurs
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-ktu-light-blue">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ktu-dark-grey" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-ktu-light-blue focus:border-ktu-orange"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 border-ktu-light-blue">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full md:w-40 border-ktu-light-blue">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-44 border-ktu-light-blue">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-ktu-deep-blue">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'} Found
          </h2>
          <div className="text-sm text-ktu-dark-grey">
            Showing {sortedProducts.length} of {sampleProducts.length} products
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-ktu-dark-grey opacity-50" />
            <h3 className="text-lg font-semibold text-ktu-deep-blue mb-2">No products found</h3>
            <p className="text-ktu-dark-grey mb-4">Try adjusting your search terms or filters</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange('all');
                setSortBy('newest');
              }}
              className="bg-ktu-orange hover:bg-ktu-orange-light"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sortedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-white py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-ktu-deep-blue mb-3">
            Discover Student Innovation
          </h2>
          <p className="text-ktu-dark-grey mb-4 max-w-xl mx-auto">
            Browse products from talented KTU student entrepreneurs. Support local innovation and find unique items created by your fellow students.
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-ktu-dark-grey mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Quality Products</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Student Made</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Local Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}