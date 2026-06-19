"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { ArrowLeft, Bookmark, ShoppingCart, Heart } from "lucide-react";
import toast from "react-hot-toast";

export default function EbookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/ebooks/${id}`);
        setEbook(res.data.data);

        if (user) {
          try {
            const purchaseRes = await api.get(`/stripe/check/${id}`);
            setPurchased(purchaseRes.data.purchased);
          } catch {}

          try {
            const bookmarksRes = await api.get("/bookmarks");
            setBookmarked(bookmarksRes.data.data?.some((b) => b.ebook?._id === id));
          } catch {}

          try {
            const wishlistRes = await api.get("/wishlist");
            setWishlisted(wishlistRes.data.data?.some((w) => w.ebook?._id === id));
          } catch {}
        }
      } catch {
        toast.error("Ebook not found");
        router.push("/browse");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user, router]);

  async function handlePurchase() {
    if (!user) {
      router.push("/login");
      return;
    }
    setPurchasing(true);
    try {
      const res = await api.post("/stripe/create-checkout", { ebookId: id });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPurchasing(false);
    }
  }

  async function toggleBookmark() {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await api.post("/bookmarks", { ebookId: id });
        setBookmarked(true);
        toast.success("Bookmarked!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleWishlist() {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${id}`);
        setWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist", { ebookId: id });
        setWishlisted(true);
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 grid gap-8 md:grid-cols-[300px_1fr]">
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!ebook) return null;

  const isOwner = user && (ebook.writer?._id === user.id || ebook.writer?.id === user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/browse"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div>
          {ebook.coverImage ? (
            <img
              src={ebook.coverImage}
              alt={`Cover of ${ebook.title}`}
              className="w-full rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-80 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-6xl font-bold text-primary/30 font-serif">
                {ebook.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">{ebook.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{ebook.genre}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            by {ebook.writer?.name || "Unknown"} &middot;{" "}
            {new Date(ebook.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {ebook.description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-2xl font-bold text-foreground">
              {ebook.price === 0 ? "Free" : `$${ebook.price.toFixed(2)}`}
            </span>
            <span className="text-sm text-muted-foreground">
              {ebook.soldCount} purchased
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {isOwner ? (
              <Button disabled>This is your ebook</Button>
            ) : purchased ? (
              <Button disabled>Already Purchased</Button>
            ) : (
              <Button onClick={handlePurchase} disabled={purchasing}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {purchasing ? "Processing..." : "Purchase"}
              </Button>
            )}
            <Button variant="outline" onClick={toggleBookmark}>
              <Bookmark
                className={`mr-2 h-4 w-4 ${bookmarked ? "fill-primary text-primary" : ""}`}
              />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button variant="outline" onClick={toggleWishlist}>
              <Heart
                className={`mr-2 h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : ""}`}
              />
              {wishlisted ? "Wishlisted" : "Wishlist"}
            </Button>
          </div>
        </div>
      </div>

      {(purchased || isOwner) && ebook.fullContent && (
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-bold text-foreground">Full Content</h2>
          <div className="mt-4 prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
            {ebook.fullContent}
          </div>
        </div>
      )}
    </div>
  );
}
