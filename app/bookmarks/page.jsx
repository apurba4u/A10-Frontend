"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkX } from "lucide-react";
import toast from "react-hot-toast";

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await api.get("/bookmarks");
        setBookmarks(res.data.data);
      } catch {
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function remove(ebookId) {
    try {
      await api.delete(`/bookmarks/${ebookId}`);
      setBookmarks((prev) => prev.filter((b) => b.ebook?._id !== ebookId));
      toast.success("Bookmark removed");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        My Bookmarks
      </h1>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-36 w-full rounded-lg" />
                <Skeleton className="mt-3 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookmarkX className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No bookmarks yet
            </p>
            <p className="text-sm text-muted-foreground/70">
              Browse ebooks and save your favorites here.
            </p>
            <Button asChild className="mt-4">
              <Link href="/browse">Browse Ebooks</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bookmarks.map((b) => {
            const ebook = b.ebook;
            if (!ebook) return null;
            return (
              <Card key={b._id} className="group relative overflow-hidden">
                <Link href={`/ebook/${ebook._id}`}>
                  {ebook.coverImage ? (
                    <img
                      src={ebook.coverImage}
                      alt={ebook.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-4xl font-bold text-primary/30 font-serif">
                        {ebook.title?.charAt(0)}
                      </span>
                    </div>
                  )}
                </Link>
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base">
                    <Link
                      href={`/ebook/${ebook._id}`}
                      className="hover:underline"
                    >
                      {ebook.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {ebook.price === 0 ? "Free" : `$${ebook.price.toFixed(2)}`}
                  </span>
                  <Badge variant="secondary">{ebook.genre}</Badge>
                </CardContent>
                <button
                  onClick={() => remove(ebook._id)}
                  className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  aria-label="Remove bookmark"
                >
                  <BookmarkX className="h-4 w-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
