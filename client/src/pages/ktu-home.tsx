import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Store, BookOpen, MessageCircle, TrendingUp, Award, 
  ArrowRight, ChevronRight, Building2, Lightbulb, Network,
  Star, Heart, Eye, Clock, Briefcase, GraduationCap, Target,
  Rocket, Handshake, Globe, Shield, Zap, Timer, Gavel, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import type { Product, User } from '@shared/schema';
import { getCategoryLabel } from '@shared/categories';
import { ProductRating } from '@/components/product-rating';

// KTU BizConnect Business Card Component with Real Rating
const BusinessCard = ({ business }: { business: any }) => {
  // Fetch real rating for this business
  const { data: ratingStats } = useQuery<{ averageRating: number; totalRatings: number }>({
    queryKey: [`/api/businesses/${business.id}/rating-stats`],
    enabled: !!business.id,
  });

  const averageRating = ratingStats?.averageRating || 0;

  return (
    <Link href={`/business/${business.id}`} className="block h-full">
      <div className="ktu-card animate-card-lift h-full group">
        <div className="relative overflow-hidden">
          <div 
            className="w-full h-40 group-hover:scale-105 transition-transform duration-300"
            style={{
              backgroundImage: business.banner_url && typeof business.banner_url === 'object' && business.banner_url.url 
                ? `url(${business.banner_url.url})` 
                : 'linear-gradient(to right, #fb923c, #ea580c)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-2 right-2">
              <span className="bg-white/90 text-ktu-deep-blue px-2 py-1 rounded text-xs font-medium">
                {business.categoryLabel || business.category}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-ktu-deep-blue mb-1 line-clamp-1">{business.name}</h3>
          <p className="text-sm text-ktu-dark-grey mb-2 line-clamp-2">{business.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-ktu-dark-grey">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}</span>
            </div>
            <Button size="sm" variant="ghost" className="text-ktu-orange hover:text-ktu-orange hover:bg-ktu-light-blue">
              View <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Product Card for 6-per-row layout
const ProductCard = ({ product }: { product: any }) => {
  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <div className="ktu-card animate-card-lift h-full group">
        <div className="relative overflow-hidden">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop"} 
            alt={product.name}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-ktu-orange text-white text-xs px-2 py-1 rounded font-medium">
              ₵{product.price}
            </span>
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-medium text-ktu-deep-blue text-sm mb-1 line-clamp-1">{product.name}</h4>
          <p className="text-xs text-ktu-dark-grey line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-2">
            <ProductRating 
              productId={product.id} 
              size="sm" 
              showCount={true} 
              interactive={true}
            />
            <Heart className="h-4 w-4 text-ktu-dark-grey hover:text-ktu-orange cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// Quick Sale Card Component
const QuickSaleCard = ({ sale }: { sale: any }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(sale.ends_at).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately on mount
    calculateTimeLeft();
    
    // Then update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [sale.ends_at]);

  return (
    <Link href={`/quick-sale/${sale.id}`} className="block h-full">
      <div className="ktu-card animate-card-lift h-full group bg-gradient-to-br from-orange-50 to-white">
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {timeLeft ? (
                <>
                  {timeLeft.days > 0 && `${timeLeft.days}d `}
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </>
              ) : 'Ended'}
            </span>
          </div>
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-ktu-orange text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
              <Gavel className="h-3 w-3" />
              Live
            </span>
          </div>
        </div>
        <div className="p-4">
          <h4 className="font-bold text-ktu-deep-blue text-base mb-2 line-clamp-1">{sale.title}</h4>
          <p className="text-xs text-ktu-dark-grey mb-3 line-clamp-2">{sale.description}</p>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ktu-dark-grey flex items-center gap-1">
                <Package className="h-3 w-3" />
                Items
              </span>
              <span className="font-semibold text-ktu-deep-blue">{sale.productsCount || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ktu-dark-grey flex items-center gap-1">
                <Gavel className="h-3 w-3" />
                Bids
              </span>
              <span className="font-semibold text-ktu-deep-blue">{sale.bidsCount || 0}</span>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ktu-dark-grey">Highest Bid</span>
              <span className="text-lg font-bold text-ktu-orange">
                {sale.highestBid ? `GH₵${sale.highestBid}` : 'No bids'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function KTUHome() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch real businesses data and randomize for homepage
  const { data: businessesData = [], isLoading: businessesLoading } = useQuery<User[]>({
    queryKey: ['/api/vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors');
      if (!response.ok) throw new Error('Failed to fetch businesses');
      const data = await response.json();
      // Randomize the businesses for homepage display
      return data.sort(() => Math.random() - 0.5);
    }
  });

  // Fetch real products data and randomize for homepage  
  const { data: productsData = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      // Randomize the products for homepage display
      return data.sort(() => Math.random() - 0.5);
    }
  });

  // Fetch Quick Sales/Auctions
  const { data: quickSalesData = [], isLoading: quickSalesLoading } = useQuery<any[]>({
    queryKey: ['/api/quick-sales'],
    staleTime: 30000, // Refetch every 30 seconds to keep bids count updated
  });

  // Fetch platform statistics
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/platform/stats'],
    queryFn: async () => {
      const response = await fetch('/api/platform/stats');
      if (!response.ok) throw new Error('Failed to fetch platform stats');
      return response.json();
    }
  });

  // Hero slides with KTU focus
  const heroSlides = [
    {
      id: 1,
      title: "WELCOME TO KTU BIZCONNECT",
      subtitle: "Your Gateway to Student Entrepreneurship",
      description: "Connect, collaborate, and grow your business at Koforidua Technical University",
      bgGradient: "ktu-hero-gradient",
      ctaText: "GET STARTED"
    },
    {
      id: 2,
      title: "BUILD YOUR BUSINESS",
      subtitle: "From Idea to Success",
      description: "Access mentorship, resources, and a thriving community of student entrepreneurs",
      bgGradient: "ktu-orange-gradient", 
      ctaText: "EXPLORE NOW"
    },
    {
      id: 3,
      title: "CONNECT & NETWORK",
      subtitle: "Join the Community",
      description: "Meet fellow entrepreneurs, share experiences, and build lasting partnerships",
      bgGradient: "ktu-hero-gradient",
      ctaText: "JOIN TODAY"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Quick action tiles
  const quickActions = [
    { 
      title: "STUDENT BUSINESSES", 
      subtitle: "Browse & Support", 
      icon: Store,
      color: "ktu-hero-gradient",
      link: "/student-businesses"
    },
    { 
      title: "MENTORSHIP HUB", 
      subtitle: "Learn & Grow", 
      icon: GraduationCap,
      color: "ktu-orange-gradient",
      link: "/mentorship"
    },
    { 
      title: "BUSINESS RESOURCES", 
      subtitle: "Tools & Guides", 
      icon: BookOpen,
      color: "ktu-hero-gradient",
      link: "/resources"
    },
    { 
      title: "COMMUNITY FORUM", 
      subtitle: "Connect & Share", 
      icon: MessageCircle,
      color: "ktu-orange-gradient",
      link: "/community"
    }
  ];

  // Categories with real counts from database
  const categories = [
    { 
      name: "Tech & Innovation", 
      bgImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop",
      count: platformStats?.categoryBreakdown?.['tech-and-innovation'] || 0
    },
    { 
      name: "Fashion & Design", 
      bgImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop",
      count: platformStats?.categoryBreakdown?.['fashion-and-design'] || 0
    },
    { 
      name: "Food & Catering", 
      bgImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop",
      count: platformStats?.categoryBreakdown?.['food-and-catering'] || 0
    },
    { 
      name: "Services", 
      bgImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      count: platformStats?.categoryBreakdown?.['services'] || 0
    },
    { 
      name: "Arts & Crafts", 
      bgImage: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=300&h=200&fit=crop",
      count: platformStats?.categoryBreakdown?.['arts-and-crafts'] || 0
    },
    { 
      name: "Digital Marketing", 
      bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
      count: platformStats?.categoryBreakdown?.['digital-marketing'] || 0
    }
  ];

  return (
    <div className="min-h-screen bg-ktu-grey">

      {/* Quick Sale / Auction Section - Top Priority */}
      {quickSalesData.length > 0 && (
        <section className="container mx-auto px-4 py-8 bg-gradient-to-r from-orange-50 to-white rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-ktu-deep-blue flex items-center gap-2">
                <Gavel className="h-6 w-6 text-ktu-orange" />
                Live Auctions & Quick Sales
              </h2>
              <p className="text-sm text-ktu-dark-grey mt-1">
                Limited-time deals - Place your bids now!
              </p>
            </div>
            <Link href="/quick-sale">
              <Button className="bg-ktu-orange hover:bg-ktu-orange/90 text-white">
                View All Auctions <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickSalesLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-52 mb-2"></div>
                  <div className="bg-gray-200 rounded h-4 mb-1"></div>
                  <div className="bg-gray-200 rounded h-3"></div>
                </div>
              ))
            ) : (
              quickSalesData
                .filter(sale => sale.status === 'active')
                .slice(0, 4)
                .map((sale) => (
                  <QuickSaleCard key={sale.id} sale={sale} />
                ))
            )}
          </div>
        </section>
      )}

      {/* Quick Actions Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.link}>
                <Card className={`${action.color} text-white hover:scale-105 transition-transform cursor-pointer`}>
                  <CardContent className="p-4 text-center">
                    <action.icon className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs opacity-90">{action.subtitle}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Businesses Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-ktu-deep-blue">Featured Student Businesses</h2>
          <Link href="/student-businesses">
            <Button variant="outline" className="border-ktu-orange text-ktu-orange hover:bg-ktu-orange hover:text-white">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {businessesLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-40 mb-2"></div>
                <div className="bg-gray-200 rounded h-4 mb-1"></div>
                <div className="bg-gray-200 rounded h-3"></div>
              </div>
            ))
          ) : (
            businessesData.slice(0, 6).map((business) => (
              <BusinessCard key={business.id} business={{
                id: business.id,
                name: business.business_name || business.full_name,
                description: business.business_description || "KTU Student Business",
                category: business.business_category || "Student Business",
                banner_url: business.banner_url,
                image: (business.profile_picture && Array.isArray(business.profile_picture) && business.profile_picture[0]?.url) || 
                       `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop`
              }} />
            ))
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-ktu-deep-blue">Featured Products</h2>
          <Link href="/products">
            <Button variant="outline" className="border-ktu-orange text-ktu-orange hover:bg-ktu-orange hover:text-white">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {productsLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-40 mb-2"></div>
                <div className="bg-gray-200 rounded h-4 mb-1"></div>
                <div className="bg-gray-200 rounded h-3"></div>
              </div>
            ))
          ) : (
            productsData.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={{
                id: product.id,
                name: product.title,
                description: product.description,
                price: product.price,
                image: (product.product_images && Array.isArray(product.product_images) && product.product_images[0]?.url) || 
                       product.image_url || 
                       `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop`
              }} />
            ))
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-ktu-deep-blue mb-6">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/student-businesses?category=${category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}>
                <Card className="relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform">
                  <div className="relative h-32">
                    <img 
                      src={category.bgImage} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ktu-deep-blue/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 text-white">
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                      <p className="text-xs opacity-90">{category.count} businesses</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto">
            {[
              { 
                label: "Student Entrepreneurs", 
                value: statsLoading ? "..." : (platformStats?.studentEntrepreneurs || 0), 
                icon: Users 
              },
              { 
                label: "Mentors Available", 
                value: statsLoading ? "..." : (platformStats?.activeMentors || 0), 
                icon: GraduationCap 
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-ktu-orange" />
                <div className="text-2xl font-bold text-ktu-deep-blue">{stat.value}</div>
                <div className="text-ktu-dark-grey">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}