import { Star, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@shared/schema';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { ProductRating } from '@/components/product-rating';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  // Use real rating data from database
  const rating = product.rating_average ? parseFloat(product.rating_average as string).toFixed(1) : "0.0";
  const ratingCount = product.rating_count || 0;

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="product-card-jumia">
        <div className="relative">
          <img 
            src={product.image_url || "/api/placeholder/140/140"} 
            alt={product.title}
            className="w-full h-[120px] md:h-[140px] lg:h-[160px] object-cover"
          />
        </div>
        <div className="price-section">
          <div className="product-title">{product.title}</div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="current-price">GH₵ {product.price}</span>
          </div>
          <ProductRating 
            productId={product.id} 
            size="sm" 
            showCount={true} 
            interactive={true}
          />
        </div>
      </div>
    </Link>
  );
};
