import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, Package, Phone, Mail, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QuickSaleProduct {
  id: string;
  title: string;
  description: string;
  condition: string;
  images: string[] | null;
}

interface QuickSaleBid {
  id: string;
  bidder_name: string;
  bid_amount: string;
  contact_number: string;
  created_at: string;
}

interface QuickSaleDetail {
  id: string;
  title: string;
  description: string;
  seller_name: string;
  seller_contact: string;
  seller_email: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  reserve_price: string | null;
  winning_bid_id: string | null;
  products: QuickSaleProduct[];
  bids: QuickSaleBid[];
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("Auction Ended");
        setIsEnded(true);
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  return (
    <div className={`flex items-center gap-2 ${isEnded ? 'text-red-600' : 'text-orange-600'}`}>
      <Clock className="h-5 w-5" />
      <span className="text-xl font-bold">{timeLeft}</span>
    </div>
  );
}

export default function QuickSaleDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [bidderName, setBidderName] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const { data: sale, isLoading } = useQuery<QuickSaleDetail>({
    queryKey: ['/api/quick-sales', id],
  });

  const placeBidMutation = useMutation({
    mutationFn: async (bidData: { bidder_name: string; bid_amount: string; contact_number: string }) => {
      return await apiRequest(`/api/quick-sales/${id}/bids`, {
        method: 'POST',
        body: JSON.stringify(bidData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quick-sales', id] });
      toast({
        title: "Bid Placed Successfully!",
        description: "Your bid has been recorded. You'll be contacted if you win.",
      });
      setBidderName("");
      setBidAmount("");
      setContactNumber("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Place Bid",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidderName || !bidAmount || !contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    placeBidMutation.mutate({
      bidder_name: bidderName,
      bid_amount: bidAmount,
      contact_number: contactNumber,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Auction Not Found</h2>
          <p className="text-gray-600 mb-4">This auction may have been removed or doesn't exist.</p>
          <Button onClick={() => setLocation('/quick-sale')}>
            View All Auctions
          </Button>
        </Card>
      </div>
    );
  }

  const highestBid = sale.bids && sale.bids.length > 0 ? sale.bids[0] : null;
  const isActive = sale.status === 'active' && new Date(sale.ends_at) > new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Badge className={isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                  {isActive ? 'Live Auction' : 'Ended'}
                </Badge>
                <CountdownTimer endsAt={sale.ends_at} />
              </div>

              <h1 className="text-3xl font-bold mb-4" data-testid="text-auction-title">
                {sale.title}
              </h1>
              
              <p className="text-gray-600 mb-6">{sale.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Seller</p>
                  <p className="font-semibold">{sale.seller_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold">{sale.seller_contact}</p>
                </div>
                {sale.seller_email && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{sale.seller_email}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Products */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Package className="h-6 w-6" />
                Items in This Auction ({sale.products.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sale.products.map((product) => (
                  <Card key={product.id} className="p-4">
                    {product.images && product.images.length > 0 && (
                      <div className="mb-3">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-40 object-cover rounded"
                        />
                        {product.images.length > 1 && (
                          <div className="flex gap-2 mt-2 overflow-x-auto">
                            {product.images.slice(1).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`${product.title} ${idx + 2}`}
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-75"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <h3 className="font-semibold mb-2">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <Badge variant="outline">{product.condition}</Badge>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Bidding History */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Bidding History</h2>
              
              {sale.bids.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No bids yet. Be the first to bid!</p>
              ) : (
                <div className="space-y-3">
                  {sale.bids.map((bid, index) => (
                    <div 
                      key={bid.id}
                      className={`p-4 rounded-lg ${index === 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="h-5 w-5 text-orange-600" />}
                          <div>
                            <p className="font-semibold">{bid.bidder_name}</p>
                            <p className="text-sm text-gray-600">{bid.contact_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-600">GH₵{bid.bid_amount}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(bid.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Bidding Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-4">Place Your Bid</h2>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Current Highest Bid</p>
                <p className="text-3xl font-bold text-orange-600" data-testid="text-current-highest-bid">
                  {highestBid ? `GH₵${highestBid.bid_amount}` : 'No bids yet'}
                </p>
              </div>

              {!isActive ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">This auction has ended</p>
                  <Button onClick={() => setLocation('/quick-sale')} className="w-full">
                    View Active Auctions
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <Label htmlFor="bidder_name">Your Name *</Label>
                    <Input
                      id="bidder_name"
                      value={bidderName}
                      onChange={(e) => setBidderName(e.target.value)}
                      placeholder="Enter your name"
                      data-testid="input-bidder-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bid_amount">Bid Amount (GH₵) *</Label>
                    <Input
                      id="bid_amount"
                      type="number"
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={highestBid ? `Above ${highestBid.bid_amount}` : "Enter your bid"}
                      data-testid="input-bid-amount"
                    />
                    {highestBid && (
                      <p className="text-xs text-gray-500 mt-1">
                        Must be higher than GH₵{highestBid.bid_amount}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contact_number">Contact Number *</Label>
                    <Input
                      id="contact_number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Your phone number"
                      data-testid="input-contact-number"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll contact you if you win
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={placeBidMutation.isPending}
                    data-testid="button-place-bid"
                  >
                    {placeBidMutation.isPending ? 'Placing Bid...' : 'Place Bid'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By bidding, you agree to purchase if you win
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
