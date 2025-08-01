import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductRatingProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  interactive?: boolean;
  className?: string;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
}

interface UserRating {
  rating: number;
  id: string;
}

export function ProductRating({ 
  productId, 
  size = 'md', 
  showCount = true, 
  interactive = true,
  className 
}: ProductRatingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fetch rating stats for this product
  const { data: ratingStats } = useQuery<RatingStats>({
    queryKey: [`/api/products/${productId}/rating-stats`],
    enabled: !!productId,
  });

  // Fetch user's current rating for this product
  const { data: userRating } = useQuery<UserRating | null>({
    queryKey: [`/api/products/${productId}/user-rating`],
    enabled: !!productId && !!user,
  });

  // Rate product mutation
  const rateMutation = useMutation({
    mutationFn: (rating: number) => apiRequest(`/api/products/${productId}/rate`, {
      method: 'POST',
      body: { rating }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/rating-stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/user-rating`] });
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

  // Remove rating mutation
  const removeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/products/${productId}/rating`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/rating-stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/user-rating`] });
      toast({
        title: "Success",
        description: "Your rating has been removed!"
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

  const handleStarClick = (rating: number) => {
    if (!user || !interactive) return;
    
    if (userRating && userRating.rating === rating) {
      // If clicking the same rating, remove it
      removeMutation.mutate();
    } else {
      // Otherwise, set the new rating
      rateMutation.mutate(rating);
    }
  };

  const handleStarHover = (rating: number) => {
    if (!user || !interactive) return;
    setHoveredRating(rating);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const averageRating = ratingStats?.averageRating || 0;
  const totalRatings = ratingStats?.totalRatings || 0;
  const currentUserRating = userRating?.rating || 0;
  const displayRating = hoveredRating || currentUserRating || 0;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {/* Show single star with rating for display, or interactive stars when user can rate */}
      {interactive && user ? (
        <div 
          className="flex items-center space-x-0.5"
          onMouseLeave={handleMouseLeave}
          data-testid={`product-rating-${productId}`}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = hoveredRating ? star <= hoveredRating : star <= currentUserRating;
            
            return (
              <Star
                key={star}
                className={cn(
                  sizeClasses[size],
                  "transition-colors cursor-pointer",
                  isActive 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-300 hover:text-yellow-400"
                )}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                data-testid={`star-${star}-product-${productId}`}
              />
            );
          })}
        </div>
      ) : (
        <Star className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
      )}
      
      {showCount && (
        <span className={cn("text-ktu-dark-grey", textSizeClasses[size])}>
          {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
        </span>
      )}
    </div>
  );
}