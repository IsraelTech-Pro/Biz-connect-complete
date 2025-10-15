import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Clock, Package, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface QuickSale {
  id: string;
  title: string;
  description: string;
  seller_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
  reserve_price: string | null;
  productsCount: number;
  bidsCount: number;
  highestBid: number | null;
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-2 text-orange-600">
      <Clock className="h-4 w-4" />
      <span className="font-semibold">{timeLeft}</span>
    </div>
  );
}

export default function QuickSaleListing() {
  const { data: quickSales, isLoading } = useQuery<QuickSale[]>({
    queryKey: ['/api/quick-sales'],
    staleTime: 30000, // Refetch every 30 seconds to keep bids count updated
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const activeSales = quickSales?.filter(sale => sale.status === 'active') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Quick Sales & Auctions</h1>
          <p className="text-lg text-orange-50 mb-6">
            Browse ongoing auctions and place your bids. No account needed!
          </p>
          <Link href="/quick-sale/create">
            <Button 
              size="lg" 
              variant="secondary"
              className="hover:bg-orange-50"
              style={{ backgroundColor: '#ffffff', color: '#ea580c' }}
              data-testid="button-create-auction"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Start Your Auction
            </Button>
          </Link>
        </div>
      </div>

      {/* Listings */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Active Auctions</h2>
          <p className="text-gray-600">
            {activeSales.length} active auction{activeSales.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : activeSales.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Auctions</h3>
            <p className="text-gray-600 mb-6">
              Be the first to start an auction and sell your items quickly!
            </p>
            <Link href="/quick-sale/create">
              <Button data-testid="button-create-first-auction">
                Create Your Auction
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSales.map((sale) => (
              <Link key={sale.id} href={`/quick-sale/${sale.id}`}>
                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  data-testid={`card-auction-${sale.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-orange-500 text-white">
                      {sale.status === 'active' ? 'Live Auction' : 'Ended'}
                    </Badge>
                    <CountdownTimer endsAt={sale.ends_at} />
                  </div>

                  <h3 className="text-xl font-bold mb-2" data-testid={`text-auction-title-${sale.id}`}>
                    {sale.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {sale.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Seller:</span>
                      <span className="font-semibold">{sale.seller_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-semibold">{sale.productsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bids:</span>
                      <span className="font-semibold">{sale.bidsCount}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Highest Bid:</span>
                      <span 
                        className="text-xl font-bold text-orange-600"
                        data-testid={`text-highest-bid-${sale.id}`}
                      >
                        {sale.highestBid ? `GH₵${sale.highestBid}` : 'No bids yet'}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
