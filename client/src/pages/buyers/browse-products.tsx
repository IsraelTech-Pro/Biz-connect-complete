import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import type { Product } from '@shared/schema';
import { ProductRating } from '@/components/product-rating';

// Category icons mapping
const categoryIcons: { [key: string]: string } = {
  'electronics': '📱',
  'fashion': '👗',
  'home & garden': '🏠',
  'sports': '⚽',
  'books': '📚',
  'art & crafts': '🎨',
  'beauty': '💄',
  'automotive': '🚗',
  'health': '💊',
  'toys': '🧸',
  'jewelry': '💍',
  'music': '🎵',
  'default': '🛍️'
};

const brands = [
  'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo', 'OnePlus', 'Google', 'Sony', 'LG'
];

const priceRanges = [
  { label: 'Under GH₵ 500', min: 0, max: 500 },
  { label: 'GH₵ 500 - GH₵ 1,000', min: 500, max: 1000 },
  { label: 'GH₵ 1,000 - GH₵ 2,000', min: 1000, max: 2000 },
  { label: 'GH₵ 2,000 - GH₵ 5,000', min: 2000, max: 5000 },
  { label: 'Over GH₵ 5,000', min: 5000, max: 999999 }
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
];

export default function BrowseProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [sortBy, setSortBy] = useState('popular');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  
  // Get search parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1));
    }
  }, []);
  
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Extract unique categories from products
  const uniqueCategories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category.toLowerCase());
      }
    });
    return Array.from(categorySet).map(category => ({
      name: category,
      displayName: category.charAt(0).toUpperCase() + category.slice(1),
      icon: categoryIcons[category.toLowerCase()] || categoryIcons.default,
      count: products.filter(p => p.category.toLowerCase() === category).length
    }));
  }, [products]);

  // Filter products based on search, brand, and price (but not category for grouping)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrands.length === 0 || 
                        selectedBrands.some(brand => product.title.toLowerCase().includes(brand.toLowerCase()));
    
    let matchesPrice = true;
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.label === selectedPriceRange);
      if (range) {
        const productPrice = parseFloat(product.price);
        matchesPrice = productPrice >= range.min && productPrice <= range.max;
      }
    }
    
    return matchesSearch && matchesBrand && matchesPrice;
  });

  // Group products by category
  const groupedProducts = useMemo(() => {
    if (selectedCategory) {
      // If specific category is selected, show only that category
      const categoryProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      return [{
        categoryName: selectedCategory,
        categoryDisplayName: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
        categoryIcon: categoryIcons[selectedCategory.toLowerCase()] || categoryIcons.default,
        products: categoryProducts
      }];
    }
    
    // Otherwise, group all products by category
    const grouped = uniqueCategories.map(category => {
      const categoryProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.name
      );
      return {
        categoryName: category.name,
        categoryDisplayName: category.displayName,
        categoryIcon: category.icon,
        products: categoryProducts
      };
    }).filter(group => group.products.length > 0);
    
    return grouped;
  }, [filteredProducts, selectedCategory, uniqueCategories]);

  // Sort products within each category
  const sortProductsInCategory = (products: Product[]) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return Math.random() - 0.5; // Random for demo
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'popular':
        default:
          return Math.random() - 0.5; // Random for demo
      }
    });
  };

  const totalFilteredProducts = filteredProducts.length;

  // Helper functions (keeping for future use)
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setSelectedPriceRange('');
    setSearchTerm('');
  };

  const VendorHubProductCard = ({ product }: { product: Product }) => {
    
    return (
      <Link to={`/products/${product.id}`} className="block h-full">
        <div className="product-card-vendorhub">
          <div className="relative overflow-hidden">
            <img 
              src={product.image_url || "/api/placeholder/140/140"} 
              alt={product.title}
              className="w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {discountPercent > 0 && (
              <div className="discount-badge animate-pulse">
                -{discountPercent}%
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="card-content">
            <div className="flex-grow">
              <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
                {product.title.length > 25 ? product.title.substring(0, 25) + '...' : product.title}
              </h3>
              
              <ProductRating 
                productId={product.id} 
                size="sm" 
                showCount={true} 
                interactive={false}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <span className="text-orange-600 font-bold text-sm">GH₵ {product.price}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="app-container">
        {/* Blue Call to Order Banner - Mobile Only */}
        <div className="md:hidden bg-blue-600 text-white py-2 px-4 text-sm font-medium text-center">
          📞 Call to Order - 0302 740 642
        </div>
        
        {/* Category Icons Navigation - Horizontal Scrolling */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="mobile-padding">
            <div className="flex items-center overflow-x-auto scrollbar-hide gap-4 md:gap-6 pb-2">
              {/* All Categories Button */}
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex flex-col items-center gap-1 min-w-[60px] md:min-w-[80px] group flex-shrink-0 ${
                  !selectedCategory ? 'text-orange-500' : 'text-gray-700'
                }`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-colors ${
                  !selectedCategory 
                    ? 'bg-orange-100 text-orange-500' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  🛍️
                </div>
                <span className="text-xs md:text-sm font-medium text-center leading-tight">
                  All
                </span>
                <span className="text-xs text-gray-500">
                  ({products.length})
                </span>
              </button>

              {/* Dynamic Categories from Database */}
              {uniqueCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex flex-col items-center gap-1 min-w-[60px] md:min-w-[80px] group flex-shrink-0 ${
                    selectedCategory === category.name ? 'text-orange-500' : 'text-gray-700'
                  }`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-colors ${
                    selectedCategory === category.name 
                      ? 'bg-orange-100 text-orange-500' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    {category.icon}
                  </div>
                  <span className="text-xs md:text-sm font-medium text-center leading-tight">
                    {category.displayName}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mobile-padding py-6">
          {/* Sort and Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {totalFilteredProducts} products found
                {selectedCategory && ` in ${selectedCategory}`}
              </span>
              {selectedCategory && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {selectedCategory}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:border-orange-500 focus:ring-0"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Display - Grouped by Category OR Single Category List */}
          {isLoading ? (
            <div className="product-section-container">
              <div className="mobile-padding py-6">
                <div className="product-grid">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-[120px] rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : groupedProducts.length > 0 ? (
            selectedCategory ? (
              // Single Category View - List all products without grid sections
              <div className="animate-fade-in-up">
                {groupedProducts.map((group, groupIndex) => {
                  const sortedGroupProducts = sortProductsInCategory(group.products);
                  
                  return (
                    <div key={group.categoryName}>
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                            {group.categoryIcon}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              {group.categoryDisplayName}
                            </h2>
                            <p className="text-sm text-gray-600">
                              {group.products.length} products available
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setSelectedCategory('')}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium bg-orange-50 px-4 py-2 rounded-lg"
                        >
                          View All Categories
                        </button>
                      </div>

                      {/* Products in Organized Grid Format - Same as Homepage */}
                      <div className="product-section-container">
                        <div className="mobile-padding py-6">
                          <div className="product-grid">
                            {sortedGroupProducts.map((product, index) => (
                              <VendorHubProductCard key={`${product.id}-${groupIndex}-${index}`} product={product} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // All Categories View - Grid sections for each category
              <div className="space-y-8">
                {groupedProducts.map((group, groupIndex) => {
                  const sortedGroupProducts = sortProductsInCategory(group.products);
                  
                  return (
                    <div key={group.categoryName} className="animate-fade-in-up">
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">
                            {group.categoryIcon}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              {group.categoryDisplayName}
                            </h2>
                            <p className="text-sm text-gray-600">
                              {group.products.length} products
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setSelectedCategory(group.categoryName)}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          View All
                        </button>
                      </div>

                      {/* Products Grid for this Category */}
                      <div className="product-section-container">
                        <div className="mobile-padding py-6">
                          <div className="product-grid">
                            {sortedGroupProducts.map((product, index) => (
                              <VendorHubProductCard key={`${product.id}-${groupIndex}-${index}`} product={product} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="product-section-container">
              <div className="mobile-padding py-6">
                <div className="bg-white rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}