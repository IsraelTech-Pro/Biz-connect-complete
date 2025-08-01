import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Star,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Product, User } from "@shared/schema";

export default function ContactVendorPage() {
  const [, setLocation] = useLocation();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const productId = searchParams.get('productId');

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: vendor, isLoading: vendorLoading } = useQuery<User>({
    queryKey: ["/api/users", product?.vendor_id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${product?.vendor_id}`);
      return response.json();
    },
    enabled: !!product?.vendor_id,
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  const handleWhatsAppContact = () => {
    if (!vendor || !vendor.whatsapp || !product) return;
    
    const message = `Hi! I'm interested in your product "${product.title}" (GH₵${parseFloat(product.price).toFixed(2)}) from KTU BizConnect. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneCall = () => {
    if (!vendor || !vendor.phone) return;
    window.location.href = `tel:${vendor.phone}`;
  };

  const handleEmailContact = () => {
    if (!vendor || !product) return;
    
    const subject = `Inquiry about ${product.title} - KTU BizConnect`;
    const body = `Hello ${vendor.full_name},\n\nI'm interested in your product "${product.title}" (GH₵${parseFloat(product.price).toFixed(2)}) listed on KTU BizConnect.\n\nCould you please provide more information about:\n- Availability\n- Delivery options\n- Payment methods\n\nThank you!\n\nBest regards`;
    
    window.location.href = `mailto:${vendor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (productLoading || vendorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product or Vendor Not Found</h1>
          <Button onClick={handleBack} className="btn-orange-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Contact Seller</h1>
          <p className="text-gray-600 mt-2">
            Get in touch with the seller to purchase this product
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Product Image */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-sm mx-auto">
                  <img
                    src={product.image_url || '/placeholder-product.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.title}
                  </h2>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-orange-600">
                      GH₵{parseFloat(product.price).toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {product.stock_quantity} in stock
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Category: {product.category}</span>
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Information & Contact */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-orange-600">
                        {vendor.business_name?.[0] || vendor.full_name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {vendor.business_name || vendor.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">KTU Student Entrepreneur</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">(4.0)</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Verified KTU Student</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Usually responds within a few hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <p className="text-sm text-gray-600">
                  Use the information below to contact the seller
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Phone Number */}
                  {vendor.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Phone</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {vendor.phone}
                        </p>
                      </div>
                      <Button
                        onClick={handlePhoneCall}
                        size="sm"
                        className="ml-auto bg-blue-600 hover:bg-blue-700"
                      >
                        Call
                      </Button>
                    </div>
                  )}

                  {/* WhatsApp Number */}
                  {vendor.whatsapp && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">WhatsApp</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {vendor.whatsapp}
                        </p>
                      </div>
                      <Button
                        onClick={handleWhatsAppContact}
                        size="sm"
                        className="ml-auto bg-green-600 hover:bg-green-700"
                      >
                        Message
                      </Button>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Mail className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Email</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {vendor.email}
                      </p>
                    </div>
                    <Button
                      onClick={handleEmailContact}
                      size="sm"
                      className="ml-auto bg-orange-600 hover:bg-orange-700"
                    >
                      Email
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Purchase Guidelines</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Contact the seller to confirm availability</li>
                    <li>• Discuss payment methods (Mobile Money preferred)</li>
                    <li>• Arrange delivery or pickup details</li>
                    <li>• Verify product condition before payment</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}