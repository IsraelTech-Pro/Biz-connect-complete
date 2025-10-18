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
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Product, User } from "@shared/schema";
import { ProductRating } from "@/components/product-rating";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportContact, setReportContact] = useState("");
  const [reporting, setReporting] = useState(false);

  const submitReport = async () => {
    if (!product) return;
    if (!reportReason.trim() || reportReason.trim().length < 3) {
      toast({ title: "Reason required", description: "Please provide a short reason.", variant: "destructive" });
      return;
    }
    try {
      setReporting(true);
      const resp = await fetch(`/api/products/${product.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reportReason.trim(),
          notes: reportNotes.trim() || undefined,
          reporter_email: reportContact.trim() || undefined,
        })
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.message || 'Failed to report product');
      toast({ title: 'Report sent', description: 'Thank you. Our admins will review this product.' });
      setReportOpen(false);
      setReportReason("");
      setReportNotes("");
      setReportContact("");
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to report product', variant: 'destructive' });
    } finally {
      setReporting(false);
    }
  };

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
                    className="w-full h-80 lg:h-96 object-contain rounded-lg border bg-white"
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setReportOpen(true)}
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Report
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
                          <p className="text-xs text-gray-600">KTU Student Entrepreneur</p>
                          {vendor.address && (
                            <p className="text-xs text-gray-600 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" /> {vendor.address}
                            </p>
                          )}
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

      {/* Report Product Modal */}
      <Dialog open={reportOpen} onOpenChange={(v) => { setReportOpen(v); if (!v) { setReportReason(""); setReportNotes(""); setReportContact(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g., Counterfeit, wrong info, fraud"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Email or Phone (optional)</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="you@example.com or 024xxxxxxx"
                value={reportContact}
                onChange={(e) => setReportContact(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <Textarea
                placeholder="Provide more details if necessary"
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
              <Button onClick={submitReport} disabled={reporting} className="btn-orange-primary">
                {reporting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
    </div>
  );
}
