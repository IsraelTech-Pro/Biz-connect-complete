import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  Heart,
  Share2,
  MapPin,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Product, User } from "@shared/schema";
import { ProductRating } from "@/components/product-rating";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: vendor } = useQuery<User>({
    queryKey: ["/api/users", product?.vendor_id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${product?.vendor_id}`);
      return response.json();
    },
    enabled: !!product?.vendor_id,
  });



  const handleShare = async () => {
    if (!product) return;

    const productUrl = `${window.location.origin}/products/${product.id}`;
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} on KTU BizConnect`,
      url: productUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User canceled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(productUrl);
        toast({
          title: "Link copied!",
          description: "Product link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share failed",
          description: "Unable to share this product.",
          variant: "destructive",
        });
      }
    }
  };

  const handleVisitStore = (vendorId: string) => {
    setLocation(`/business/${vendorId}`);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  // Get product images from database
  const productImages = product?.product_images && Array.isArray(product.product_images)
    ? product.product_images.map((img: any) => img.url)
    : product?.image_url
      ? [product.image_url]
      : [];

  // Calculate discount and other values from database
  const discountPercent = product?.discount_percentage || 0;
  const originalPrice = parseFloat(
    product?.original_price || product?.price || "0",
  );
  const currentPrice = parseFloat(product?.price || "0");
  const rating = product?.rating_average || "0";
  const ratingCount = product?.rating_count || "0";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-96 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-20 rounded"></div>
                ))}
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-black mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600">
              The product you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Call to Order Bar - Mobile Only */}
      <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium lg:hidden">
        Call to Order: 030 274 0642
      </div>

      <div className="app-container">
        <div className="mobile-padding py-6">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 border-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
              {/* Product Images - Left Side */}
              <div className="lg:col-span-6">
                {/* Main Product Image */}
                <div className="mb-4">
                  <img
                    src={
                      productImages.length > 0
                        ? productImages[selectedImage]
                        : "/api/placeholder/600/600"
                    }
                    alt={product.title}
                    className="w-full h-80 lg:h-96 object-cover rounded-lg border"
                  />
                </div>

                {/* Image Thumbnails - Only show if there are multiple images */}
                {productImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {productImages.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                          selectedImage === index
                            ? "border-orange-500"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info - Right Side */}
              <div className="lg:col-span-6 space-y-6">
                {/* Product Title */}
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-black mb-3">
                    {product.title}
                  </h1>
                  
                  {/* Product Rating */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-3">
                      <ProductRating 
                        productId={product.id} 
                        size="md" 
                        showCount={true} 
                        interactive={true}
                      />
                      <span className="text-sm text-ktu-dark-grey">
                        Click stars to rate this product
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl lg:text-3xl font-bold text-black">
                      GH₵ {currentPrice.toFixed(2)}
                    </span>
                    {discountPercent > 0 && originalPrice > currentPrice && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          GH₵ {originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                          -{discountPercent}%
                        </span>
                      </>
                    )}
                  </div>

                </div>

                

                {/* Purchase Actions */}
                <div className="space-y-4">


                  <div className="flex space-x-3">
                    <Button
                      onClick={() => window.location.href = `/contact-vendor?productId=${product.id}`}
                      size="lg"
                      className="flex-1 btn-orange-primary"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Seller
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Product
                    </Button>
                  </div>
                </div>

                {/* Vendor Info */}
                {vendor && (
                  <Card className="border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent
                      className="p-4"
                      onClick={() => handleVisitStore(vendor.id)}
                    >
                      <h3 className="font-semibold mb-3 text-gray-800">
                        Seller Information
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">
                            {vendor.business_name?.[0] || vendor.full_name[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {vendor.business_name || vendor.full_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            KTU Student Entrepreneur
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Visit Store
                        </Button>
                      </div>
                      {(vendor as any).whatsapp_number && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600">
                            Contact: {(vendor as any).whatsapp_number}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-8">
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Product Details</TabsTrigger>
                    <TabsTrigger value="specs">Specifications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        Product Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {product.description}
                      </p>

                      {product.tags && product.tags.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">Product Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="specs" className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Product ID:</span>
                            <span className="font-medium">
                              {product.id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">
                              {product.category}
                            </span>
                          </div>

                          {product.weight && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Weight:</span>
                              <span className="font-medium">
                                {product.weight} kg
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Vendor:</span>
                            <span className="font-medium">
                              {vendor?.business_name ||
                                vendor?.full_name ||
                                "KTU BizConnect"}
                            </span>
                          </div>
                          {product.sku && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">SKU:</span>
                              <span className="font-medium">{product.sku}</span>
                            </div>
                          )}
                          {product.dimensions && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Dimensions:</span>
                              <span className="font-medium">
                                {product.dimensions}
                              </span>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
