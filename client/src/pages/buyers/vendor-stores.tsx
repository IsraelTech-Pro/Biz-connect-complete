import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Store, MapPin, Star, Package } from "lucide-react";
import { User, Product } from "@shared/schema";

export default function VendorStores() {
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  if (vendorsLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="app-container">
          <div className="mobile-padding py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vendorsList = vendors || [];
  const productsList = products || [];

  // Get products count for each vendor
  const getVendorProducts = (vendorId: string) => {
    return productsList.filter((product: Product) => product.vendor_id === vendorId);
  };

  // Component to display vendor rating
  function VendorRating({ vendorId }: { vendorId: string }) {
    const { data: ratingStats } = useQuery<{ averageRating: number; totalRatings: number }>({
      queryKey: [`/api/businesses/${vendorId}/rating-stats`],
    });

    const rating = ratingStats?.averageRating || 0;
    const totalRatings = ratingStats?.totalRatings || 0;

    return (
      <div className="flex items-center">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? `${rating.toFixed(1)} (${totalRatings} reviews)` : 'No reviews yet'}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="app-container">
        {/* Blue Call to Order Banner - Mobile Only */}
        <div className="md:hidden bg-blue-600 text-white py-2 px-4 text-sm font-medium text-center">
          📞 Call to Order - 0302 740 642
        </div>

        <div className="mobile-padding py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Businesses
            </h1>
            <p className="text-gray-600">
              Discover amazing businesses run by KTU student entrepreneurs
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {vendorsList.length}
              </div>
              <div className="text-sm text-gray-600">Total Stores</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {productsList.length}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {vendorsList.filter((v: User) => v.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Active Stores</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                4.8
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>

          {/* Vendor Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorsList.map((vendor: User) => {
              const vendorProducts = getVendorProducts(vendor.id);

              return (
                <Link 
                  key={vendor.id} 
                  to={`/business/${vendor.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    {/* Store Banner */}
                    <div className="h-32 relative" style={{
                      backgroundImage: vendor.banner_url && typeof vendor.banner_url === 'object' && vendor.banner_url.url 
                        ? `url(${vendor.banner_url.url})` 
                        : 'linear-gradient(to right, #fb923c, #ea580c)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 overflow-hidden">
                          {vendor.profile_picture && typeof vendor.profile_picture === 'object' && vendor.profile_picture.url ? (
                            <img 
                              src={vendor.profile_picture.url} 
                              alt={vendor.profile_picture.alt || "Store logo"}
                              className="w-6 h-6 object-cover rounded-full"
                            />
                          ) : (
                            <Store className="w-6 h-6 text-orange-600" />
                          )}
                        </div>
                      </div>
                      {vendor.status === 'approved' && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Verified
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                            {vendor.business_name || `${vendor.full_name}'s Store`}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {vendor.business_description || 'Quality products from trusted vendor'}
                          </p>
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            Ghana
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="mb-4">
                        <VendorRating vendorId={vendor.id} />
                      </div>

                      {/* Store Stats */}
                      <div className="py-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-orange-600 mb-1">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {vendorProducts.length}
                          </div>
                          <div className="text-xs text-gray-500">Products Available</div>
                        </div>
                      </div>

                      {/* Sample Products */}
                      {vendorProducts.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Featured Products
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {vendorProducts.slice(0, 3).map((product: Product) => (
                              <div key={product.id} className="relative">
                                <img 
                                  src={product.image_url || '/api/placeholder/80/80'} 
                                  alt={product.title}
                                  className="w-full h-16 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View Business Button */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="btn-orange-primary text-center py-2 rounded-lg text-sm font-medium group-hover:bg-orange-600 transition-colors">
                          View Business
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty State */}
          {vendorsList.length === 0 && (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No student businesses found
              </h3>
              <p className="text-gray-500">
                Be the first to start your business on KTU BizConnect!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}