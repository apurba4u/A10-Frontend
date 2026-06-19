"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Minus, Plus } from "lucide-react";

export default function ReaderPage() {
  const { ebookId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/ebooks/${ebookId}`);
        setEbook(res.data.data);
      } catch {
        router.push("/browse");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ebookId, router]);

  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const scrollTop = window.scrollY;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      setProgress(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-8 h-8 w-3/4" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <Skeleton className="mt-8 h-96 w-full" />
      </div>
    );
  }

  if (!ebook) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href={user ? "/dashboard/user" : "/browse"}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {user ? "My Library" : "Browse"}
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              disabled={fontSize <= 14}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
              {fontSize}px
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setFontSize((s) => Math.min(28, s + 2))}
              disabled={fontSize >= 28}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">{progress}% read</div>
        </div>
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div ref={contentRef} className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-primary/50" />
          <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">{ebook.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            by {ebook.writer?.name || "Unknown"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{ebook.genre}</p>
        </div>

        <div className="prose prose-lg max-w-none text-foreground">
          {ebook.fullContent ? (
            <div
              className="whitespace-pre-wrap leading-relaxed text-foreground"
              style={{ fontSize: `${fontSize}px`, lineHeight: "1.8" }}
            >
              {ebook.fullContent}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No content available for this ebook.</p>
          )}
        </div>

        <div className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">You&apos;ve reached the end of this ebook.</p>
          <Link href="/browse" className="mt-4 inline-block">
            <Button variant="outline">Discover More Ebooks</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
