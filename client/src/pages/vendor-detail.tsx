import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Store, MapPin, Star, Package, Users, ShoppingBag, ArrowLeft, Grid3X3, List, Share2, Copy, Download, QrCode, Heart } from "lucide-react";
import { User, Product } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { ProductRating } from "@/components/product-rating";
import QRCode from 'qrcode';

export default function VendorDetail() {
  const { id } = useParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vendor, isLoading: vendorLoading } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
    enabled: !!id,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Rating-related queries
  const { data: ratingStats } = useQuery<{ averageRating: number; totalRatings: number }>({
    queryKey: [`/api/businesses/${id}/rating-stats`],
    enabled: !!id,
  });

  const { data: userRating } = useQuery<{ rating: number; id: string } | null>({
    queryKey: [`/api/businesses/${id}/user-rating`],
    enabled: !!id && !!user,
  });

  // Rating mutations
  const rateMutation = useMutation({
    mutationFn: (rating: number) => apiRequest(`/api/businesses/${id}/rate`, {
      method: 'POST',
      body: { rating }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/rating-stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/user-rating`] });
      setShowRatingModal(false);
      setSelectedRating(0);
      toast({
        title: "Success",
        description: "Your rating has been submitted!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteRatingMutation = useMutation({
    mutationFn: () => apiRequest(`/api/businesses/${id}/rating`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/rating-stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/user-rating`] });
      toast({
        title: "Success",
        description: "Your rating has been removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove rating. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Get the store URL for sharing
  const storeUrl = `${window.location.origin}/vendor/${id}`;

  // Rating functions
  const handleRateClick = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to rate this business.",
        variant: "destructive"
      });
      return;
    }
    setSelectedRating(userRating?.rating || 0);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = () => {
    if (selectedRating < 1 || selectedRating > 5) {
      toast({
        title: "Invalid Rating",
        description: "Please select a rating between 1 and 5 stars.",
        variant: "destructive"
      });
      return;
    }
    rateMutation.mutate(selectedRating);
  };

  const handleRemoveRating = () => {
    deleteRatingMutation.mutate();
  };

  // Generate QR code
  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(storeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Copy business URL to clipboard
  const copyStoreUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast({
        title: "Success",
        description: "Business URL copied to clipboard!",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy URL. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${vendor?.business_name || vendor?.full_name || 'student-business'}-qr.png`;
    link.href = qrCodeUrl;
    link.click();
    
    toast({
      title: "Success",
      description: "QR code downloaded successfully!",
    });
  };

  // Share via Web Share API or fallback
  const shareStore = async () => {
    const shareData = {
      title: `${vendor?.business_name || `${vendor?.full_name}'s Business`} - KTU BizConnect`,
      text: `Check out this amazing student business on KTU BizConnect! ${vendor?.business_description || 'Quality products from KTU student entrepreneur'}`,
      url: storeUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Success",
          description: "Business shared successfully!",
        });
      } catch (error) {
        console.error('Error sharing:', error);
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  // Generate QR code when modal opens
  useEffect(() => {
    if (isShareModalOpen && !qrCodeUrl) {
      generateQRCode();
    }
  }, [isShareModalOpen]);

  if (vendorLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="app-container">
          <div className="mobile-padding py-6">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-6"></div>
              <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-48"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="app-container">
          <div className="mobile-padding py-6">
            <div className="text-center">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Vendor not found
              </h3>
              <p className="text-gray-500">
                The vendor you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productsList = products || [];
  const vendorProducts = productsList.filter((product: Product) => product.vendor_id === id);

  // Get real rating data from the database
  const averageRating = ratingStats?.averageRating || 0;
  const totalRatings = ratingStats?.totalRatings || 0;

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return Math.random() - 0.5;
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'popular':
        default:
          return Math.random() - 0.5;
      }
    });
  };

  const sortedProducts = sortProducts(vendorProducts);

  const VendorHubProductCard = ({ product }: { product: Product }) => {
    
    return (
      <Link to={`/products/${product.id}`} className="block">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
          <div className="relative">
            <img 
              src={product.image_url || "/api/placeholder/140/140"} 
              alt={product.title}
              className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute top-1 left-1">
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                GH₵{product.price}
              </span>
            </div>
            <div className="absolute top-1 right-1 flex flex-col gap-0.5">
              <button className="p-1 rounded-full bg-white/90 hover:bg-white transition-colors text-gray-600">
                <Heart className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
          <div className="p-2">
            <div className="mb-1">
              <span className="text-xs text-orange-600 font-medium">{vendor?.business_name || 'KTU Vendor'}</span>
            </div>
            <h4 className="font-medium text-gray-900 text-xs mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {product.title.length > 20 ? product.title.substring(0, 20) + '...' : product.title}
            </h4>
            
            <div className="flex items-center text-xs">
              <ProductRating 
                productId={product.id} 
                size="sm" 
                showCount={true} 
                interactive={false}
              />
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

        <div className="mobile-padding py-6">
          {/* Back Button */}
          <Link to="/student-businesses" className="inline-flex items-center text-sm text-gray-600 hover:text-orange-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Student Businesses
          </Link>

          {/* Vendor Header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            {/* Store Banner */}
            <div className="h-48 relative" style={{
              backgroundImage: vendor?.banner_url && typeof vendor.banner_url === 'object' && 'url' in vendor.banner_url
                ? `url(${(vendor.banner_url as any).url})` 
                : 'linear-gradient(to right, #fb923c, #ea580c)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-3 rounded-full overflow-hidden">
                      {vendor?.profile_picture && typeof vendor.profile_picture === 'object' && 'url' in vendor.profile_picture ? (
                        <img 
                          src={(vendor.profile_picture as any).url} 
                          alt={(vendor.profile_picture as any).alt || "Store logo"}
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-orange-600" />
                      )}
                    </div>
                    <div className="text-white">
                      <h1 className="text-2xl font-bold">
                        {vendor.business_name || `${vendor.full_name}'s Store`}
                      </h1>
                      <p className="text-orange-100">
                        {vendor.business_description || 'Quality products from trusted vendor'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {vendor?.is_approved && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Verified
                      </div>
                    )}
                    <Button
                      onClick={shareStore}
                      className="btn-orange-primary flex items-center space-x-2 text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Business</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Stats and Rating */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center text-orange-600 mb-2">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{vendorProducts.length}</div>
                      <div className="text-sm text-gray-500">Products</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center text-yellow-600 mb-2">
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate This Business</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-5 h-5 ${
                                star <= averageRating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {totalRatings > 0 ? `${totalRatings} rating${totalRatings !== 1 ? 's' : ''}` : 'No ratings yet'}
                        </span>
                      </div>
                    </div>
                    
                    {user ? (
                      <div className="space-y-2">
                        {userRating ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Your rating: {userRating.rating} star{userRating.rating !== 1 ? 's' : ''}
                            </span>
                            <div className="space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleRateClick}
                                className="text-xs"
                              >
                                Update
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleRemoveRating}
                                className="text-xs text-red-600 hover:text-red-700"
                                disabled={deleteRatingMutation.isPending}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={handleRateClick}
                            size="sm"
                            style={{ 
                              backgroundColor: '#ea580c', 
                              color: 'white',
                              width: '100%'
                            }}
                            className="hover:bg-orange-700 transition-colors"
                          >
                            Rate This Business
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Login to rate this business</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Business Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {vendor.address || 'Ghana'}
                      </div>
                      <div className="flex items-center">
                        <Store className="w-4 h-4 mr-2" />
                        Active since {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not available'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>{vendor.email}</div>
                      <div>{vendor.phone || 'Phone not available'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Business Products</h2>
                  <p className="text-sm text-gray-600">
                    {vendorProducts.length} products available
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
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
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sortedProducts.map((product) => (
                    <VendorHubProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No products yet
                  </h3>
                  <p className="text-gray-500">
                    This vendor hasn't added any products to their store yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share Modal */}
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-orange-600" />
                <span>Share Store</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Store URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store URL
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={storeUrl}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={copyStoreUrl}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code
                </label>
                <div className="flex flex-col items-center space-y-4">
                  {isGeneratingQR ? (
                    <div className="w-[300px] h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Generating QR code...</p>
                      </div>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="relative">
                      <img 
                        src={qrCodeUrl} 
                        alt="Store QR Code" 
                        className="w-[300px] h-[300px] border border-gray-200 rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <Button
                          onClick={downloadQRCode}
                          variant="secondary"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-[300px] h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">QR code will appear here</p>
                      </div>
                    </div>
                  )}
                  
                  {qrCodeUrl && (
                    <Button
                      onClick={downloadQRCode}
                      className="btn-orange-primary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download QR Code</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Share Instructions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">How to share:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Copy the store URL and share it directly</li>
                  <li>• Download the QR code and share as an image</li>
                  <li>• When someone scans the QR code, they'll visit your store</li>
                  <li>• Perfect for business cards, flyers, or social media</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rating Modal */}
        <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rate {vendor?.business_name || "this business"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  How would you rate your experience with this business?
                </p>
                <div className="flex justify-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                      data-testid={`rating-star-${star}`}
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= selectedRating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {selectedRating > 0 && (
                  <p className="text-sm text-gray-600">
                    You selected {selectedRating} star{selectedRating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedRating(0);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRatingSubmit}
                  disabled={selectedRating === 0 || rateMutation.isPending}
                  data-testid="submit-rating"
                  style={{ 
                    backgroundColor: '#ea580c', 
                    color: 'white'
                  }}
                  className="flex-1 hover:bg-orange-700 transition-colors"
                >
                  {rateMutation.isPending ? "Submitting..." : "Submit Rating"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}