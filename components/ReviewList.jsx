"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function StarRating({ rating, size = "sm" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

export function RatingOverview({ averageRating, reviewCount, distribution }) {
  if (!reviewCount) return null;

  return (
    <div className="flex items-start gap-6">
      <div className="text-center">
        <p className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
        <StarRating rating={Math.round(averageRating)} size="md" />
        <p className="mt-1 text-xs text-muted-foreground">{reviewCount} reviews</p>
      </div>
      {distribution && (
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-xs text-muted-foreground">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReviewList({ ebookId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, reviewCount: 0, distribution: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          api.get(`/reviews/ebook/${ebookId}`),
          api.get(`/reviews/ebook/${ebookId}/stats`),
        ]);
        setReviews(reviewsRes.data.data?.reviews || []);
        setStats(statsRes.data.data || {});
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [ebookId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RatingOverview
        averageRating={stats.averageRating}
        reviewCount={stats.reviewCount}
        distribution={stats.distribution}
      />

      {reviews.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.user?.avatar} />
                    <AvatarFallback className="text-xs">
                      {review.user?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {review.user?.name || "Anonymous"}
                      </span>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="mt-1.5 text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
