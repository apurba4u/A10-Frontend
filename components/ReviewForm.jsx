"use client";

import { useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

export default function ReviewForm({ ebookId, existingReview, onReviewUpdated }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isEditing = !!existingReview;

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        const res = await api.put(`/reviews/${existingReview._id}`, {
          rating,
          comment: comment.trim(),
        });
        toast.success("Review updated!");
        setSubmitted(true);
        if (onReviewUpdated) onReviewUpdated(res.data.data);
      } else {
        const res = await api.post(`/reviews/ebook/${ebookId}`, {
          rating,
          comment: comment.trim(),
        });
        toast.success("Review submitted!");
        setSubmitted(true);
        if (onReviewUpdated) onReviewUpdated(res.data.data);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-foreground">
          {isEditing ? "Review updated!" : "Thank you for your review!"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Your feedback helps other readers.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h3 className="font-serif text-lg font-semibold text-foreground">
        {isEditing ? "Edit Review" : "Write a Review"}
      </h3>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          )}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this ebook..."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-muted-foreground">{comment.length}/1000</p>
      </div>
      <Button type="submit" size="sm" disabled={loading || rating < 1}>
        {loading ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}
