"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Badge } from "../../components/ui/badge";
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
      <h1 className="text-3xl font-bold text-slate-900">My Bookmarks</h1>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <p className="mt-8 text-slate-500">No bookmarks yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bookmarks.map((b) => {
            const ebook = b.ebook;
            return (
              <div
                key={b._id}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <Link href={`/ebooks/${ebook?._id}`}>
                  {ebook?.cover ? (
                    <img
                      src={ebook.cover}
                      alt={ebook.title}
                      className="h-36 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                      <span className="text-3xl font-bold text-indigo-300">
                        {ebook?.title?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <h3 className="mt-3 font-semibold text-slate-900">
                    {ebook?.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {ebook?.price === 0
                        ? "Free"
                        : `$${ebook?.price?.toFixed(2)}`}
                    </span>
                    <Badge>{ebook?.category}</Badge>
                  </div>
                </Link>
                <button
                  onClick={() => remove(ebook?._id)}
                  className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 text-slate-400 hover:text-red-600"
                  aria-label="Remove bookmark"
                >
                  <BookmarkX className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
