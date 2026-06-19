"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await api.get("/wishlist");
        setWishlist(res.data.data);
      } catch {
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function remove(ebookId) {
    try {
      await api.delete(`/wishlist/${ebookId}`);
      setWishlist((prev) => prev.filter((w) => w.ebook?._id !== ebookId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">My Wishlist</h1>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-36 w-full rounded-lg" />
              <Skeleton className="mt-3 h-5 w-3/4" />
            </div>
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Your wishlist is empty.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((w) => {
            const ebook = w.ebook;
            if (!ebook) return null;
            return (
              <div key={w._id} className="group relative rounded-xl border border-border bg-card p-5 shadow-sm">
                <Link href={`/ebook/${ebook._id}`}>
                  {ebook.coverImage ? (
                    <img src={ebook.coverImage} alt={ebook.title} className="h-36 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-3xl font-bold text-primary/30 font-serif">{ebook.title?.charAt(0)}</span>
                    </div>
                  )}
                  <h3 className="mt-3 font-serif font-semibold text-foreground">{ebook.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {ebook.price === 0 ? "Free" : `$${ebook.price.toFixed(2)}`}
                    </span>
                    <Badge variant="secondary">{ebook.genre}</Badge>
                  </div>
                </Link>
                <button
                  onClick={() => remove(ebook._id)}
                  className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:text-destructive"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="h-4 w-4 fill-destructive text-destructive" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
