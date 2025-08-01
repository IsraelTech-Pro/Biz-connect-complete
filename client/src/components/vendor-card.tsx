import { Star, MapPin, Store, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@shared/schema';
import { Link } from 'wouter';

interface VendorCardProps {
  vendor: User;
  productCount?: number;
}

export const VendorCard = ({ vendor, productCount = 0 }: VendorCardProps) => {
  return (
    <Card className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover-lift border-0 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-300"></div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/20 text-white border-white/30 text-xs font-semibold">
            {productCount} products
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 -mt-6 border-3 border-white shadow-lg">
            <Store className="h-6 w-6 text-orange-500 group-hover:text-orange-600 transition-colors" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-black group-hover:text-orange-500 transition-colors duration-200">
              {vendor.business_name || vendor.full_name}
            </h4>
            <p className="text-gray-600 text-xs flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              Accra, Ghana
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {vendor.business_description || 'Quality products with excellent service and fast delivery.'}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs text-gray-600">4.8 (156)</span>
          </div>
        </div>
        
        <Link href={`/stores/${vendor.id}`}>
          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 group rounded-full text-xs font-semibold py-2">
            <Store className="h-3 w-3 mr-2" />
            Visit Store
            <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
