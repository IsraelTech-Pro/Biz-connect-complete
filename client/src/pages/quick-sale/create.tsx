import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Package, Upload, X } from "lucide-react";

interface Product {
  title: string;
  description: string;
  condition: string;
  images: File[];
}

export default function CreateQuickSale() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auction details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerContact, setSellerContact] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [sellerLocation, setSellerLocation] = useState("");

  // Products
  const [products, setProducts] = useState<Product[]>([
    { title: "", description: "", condition: "new", images: [] }
  ]);

  const addProduct = () => {
    if (products.length >= 20) {
      toast({
        title: "Maximum Products Reached",
        description: "You can only add up to 20 products per auction",
        variant: "destructive",
      });
      return;
    }
    setProducts([...products, { title: "", description: "", condition: "new", images: [] }]);
  };

  const removeProduct = (index: number) => {
    if (products.length === 1) {
      toast({
        title: "At Least One Product Required",
        description: "You must have at least one product in your auction",
        variant: "destructive",
      });
      return;
    }
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof Omit<Product, 'images'>, value: string) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const handleImageUpload = (index: number, files: FileList | null) => {
    if (!files) return;
    
    const updatedProducts = [...products];
    const currentImages = updatedProducts[index].images;
    const newImages = Array.from(files);
    
    if (currentImages.length + newImages.length > 5) {
      toast({
        title: "Too Many Images",
        description: "Maximum 5 images per product",
        variant: "destructive",
      });
      return;
    }
    
    updatedProducts[index].images = [...currentImages, ...newImages];
    setProducts(updatedProducts);
  };

  const removeImage = (productIndex: number, imageIndex: number) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex].images = updatedProducts[productIndex].images.filter((_, i) => i !== imageIndex);
    setProducts(updatedProducts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || !description || !sellerName || !sellerContact || !endsAt) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const hasInvalidProducts = products.some(p => !p.title || !p.description);
    if (hasInvalidProducts) {
      toast({
        title: "Invalid Products",
        description: "Please fill in all product details",
        variant: "destructive",
      });
      return;
    }

    const endDate = new Date(endsAt);
    if (endDate <= new Date()) {
      toast({
        title: "Invalid End Date",
        description: "End date must be in the future",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('seller_name', sellerName);
      formData.append('seller_contact', sellerContact);
      formData.append('seller_email', sellerEmail);
      formData.append('location', sellerLocation);
      formData.append('ends_at', endsAt);
      if (reservePrice) {
        formData.append('reserve_price', reservePrice);
      }
      
      // Add products without images to JSON
      const productsData = products.map(p => ({
        title: p.title,
        description: p.description,
        condition: p.condition
      }));
      formData.append('products', JSON.stringify(productsData));
      
      // Add product images
      products.forEach((product, index) => {
        product.images.forEach((image) => {
          formData.append(`product_${index}_images`, image);
        });
      });

      const response = await fetch('/api/quick-sales', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create auction');
      }

      const sale = await response.json();

      toast({
        title: "Auction Created Successfully!",
        description: "Your auction is now live. Buyers can start bidding.",
      });

      setLocation(`/quick-sale/${sale.id}`);
    } catch (error: any) {
      toast({
        title: "Failed to Create Auction",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Quick Sale / Auction</h1>
          <p className="text-gray-600">
            List up to 20 items for time-limited bidding. No business registration needed!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auction Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Auction Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Auction Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Moving Sale - Electronics & Furniture"
                  data-testid="input-auction-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your items and auction details"
                  rows={4}
                  data-testid="input-auction-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seller_name">Your Name *</Label>
                  <Input
                    id="seller_name"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Your full name"
                    data-testid="input-seller-name"
                  />
                </div>

                <div>
                  <Label htmlFor="seller_contact">Contact Number *</Label>
                  <Input
                    id="seller_contact"
                    value={sellerContact}
                    onChange={(e) => setSellerContact(e.target.value)}
                    placeholder="Your phone number"
                    data-testid="input-seller-contact"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="seller_location">Location (Optional)</Label>
                <Input
                  id="seller_location"
                  value={sellerLocation}
                  onChange={(e) => setSellerLocation(e.target.value)}
                  placeholder="e.g., Koforidua, Campus, Hall"
                  data-testid="input-seller-location"
                />
              </div>

              <div>
                <Label htmlFor="seller_email">Email (Optional)</Label>
                <Input
                  id="seller_email"
                  type="email"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  data-testid="input-seller-email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ends_at">Auction End Date & Time *</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    data-testid="input-end-date"
                  />
                </div>

                <div>
                  <Label htmlFor="reserve_price">Reserve Price (Optional)</Label>
                  <Input
                    id="reserve_price"
                    type="number"
                    step="0.01"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    placeholder="Minimum acceptable price"
                    data-testid="input-reserve-price"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Products */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products ({products.length}/20)
              </h2>
              <Button
                type="button"
                onClick={addProduct}
                disabled={products.length >= 20}
                data-testid="button-add-product"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="space-y-4">
              {products.map((product, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">Product {index + 1}</h3>
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        data-testid={`button-remove-product-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`product_title_${index}`}>Product Title *</Label>
                      <Input
                        id={`product_title_${index}`}
                        value={product.title}
                        onChange={(e) => updateProduct(index, 'title', e.target.value)}
                        placeholder="e.g., iPhone 12 Pro"
                        data-testid={`input-product-title-${index}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`product_description_${index}`}>Description *</Label>
                      <Textarea
                        id={`product_description_${index}`}
                        value={product.description}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        placeholder="Product details, specifications, etc."
                        rows={2}
                        data-testid={`input-product-description-${index}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`product_condition_${index}`}>Condition *</Label>
                      <Select
                        value={product.condition}
                        onValueChange={(value) => updateProduct(index, 'condition', value)}
                      >
                        <SelectTrigger data-testid={`select-product-condition-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like_new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Product Images (Up to 5)</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(index, e.target.files)}
                            className="flex-1"
                            data-testid={`input-product-images-${index}`}
                          />
                          <Upload className="h-5 w-5 text-gray-400" />
                        </div>
                        {product.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {product.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Product ${index + 1} image ${imgIndex + 1}`}
                                  className="w-full h-20 object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index, imgIndex)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  data-testid={`button-remove-image-${index}-${imgIndex}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {product.images.length}/5 images uploaded
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/quick-sale')}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              data-testid="button-create-auction"
            >
              {isSubmitting ? 'Creating...' : 'Create Auction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
