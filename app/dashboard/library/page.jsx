"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Library, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function LibraryPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/transactions/user");
        const all = res.data.data || [];
        const purchased = all.filter((t) => t.type === "purchase" && t.ebook);
        setPurchases(purchased);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-serif text-2xl font-bold text-foreground">My Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {purchases.length} ebook{purchases.length !== 1 ? "s" : ""} in your collection
        </p>
      </motion.div>

      {purchases.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8"
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Library className="h-16 w-16 text-muted-foreground" />
              <p className="mt-6 text-lg font-medium text-foreground">Your library is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Purchase ebooks to start building your collection
              </p>
              <Link href="/browse" className="mt-6">
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Ebooks
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="overflow-hidden transition-all hover:shadow-md">
                {p.ebook?.coverImage ? (
                  <img
                    src={p.ebook.coverImage}
                    alt={p.ebook.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <span className="text-4xl font-bold text-primary/30 font-serif">
                      {p.ebook?.title?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-serif font-semibold text-foreground line-clamp-1">
                      {p.ebook?.title}
                    </h3>
                    <Badge variant="success" className="ml-2 shrink-0 text-[10px]">
                      Purchased
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    by {p.ebook?.writer?.name || "Unknown"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Purchased {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  {p.ebook?.price === 0 && (
                    <Badge variant="secondary" className="mt-2 text-[10px]">Free</Badge>
                  )}
                  <Link href={`/reader/${p.ebook?._id}`} className="mt-3 block">
                    <Button className="w-full gap-2" size="sm">
                      <BookOpen className="h-4 w-4" />
                      Read Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
