"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Bookmark, ArrowLeft, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

export default function EbookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/ebooks/${id}`);
        setEbook(res.data.data);

        if (user) {
          const purchaseRes = await api.get(`/payments/check/${id}`);
          setPurchased(purchaseRes.data.purchased);

          try {
            const bookmarksRes = await api.get("/bookmarks");
            setBookmarked(
              bookmarksRes.data.data?.some((b) => b.ebook === id)
            );
          } catch {}
        }
      } catch {
        toast.error("Ebook not found");
        router.push("/ebooks");
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
      const res = await api.post("/payments/create-checkout", { ebookId: id });
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

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!ebook) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/ebooks"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div>
          {ebook.cover ? (
            <img
              src={ebook.cover}
              alt={ebook.title}
              className="w-full rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-80 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
              <span className="text-6xl font-bold text-indigo-300">
                {ebook.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">{ebook.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{ebook.category}</Badge>
            {ebook.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            {ebook.description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-2xl font-bold text-slate-900">
              {ebook.price === 0 ? "Free" : `$${ebook.price.toFixed(2)}`}
            </span>
            <span className="text-sm text-slate-500">
              {ebook.purchaseCount} purchased
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {purchased ? (
              ebook.file ? (
                <a
                  href={ebook.file}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button>Read Now</Button>
                </a>
              ) : (
                <Button disabled>Purchased</Button>
              )
            ) : (
              <Button onClick={handlePurchase} disabled={purchasing}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {purchasing ? "Processing..." : "Purchase"}
              </Button>
            )}
            <Button variant="outline" onClick={toggleBookmark}>
              <Bookmark
                className={`mr-2 h-4 w-4 ${
                  bookmarked ? "fill-indigo-600 text-indigo-600" : ""
                }`}
              />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
