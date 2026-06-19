"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "../../services/api";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

export default function FeaturedEbooks() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/ebooks/featured");
        setEbooks(res.data.data || []);
      } catch {
        setEbooks([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Featured Ebooks
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Discover our latest and most popular reads
        </p>
      </motion.div>

      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : ebooks.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">No ebooks available yet.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ebooks.map((ebook, i) => (
            <motion.div
              key={ebook._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link
                href={`/ebook/${ebook._id}`}
                className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
              >
                {ebook.coverImage ? (
                  <img
                    src={ebook.coverImage}
                    alt={`Cover of ${ebook.title}`}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <span className="text-5xl font-bold text-primary/30 font-serif">
                      {ebook.title.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {ebook.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  by {ebook.writer?.name || "Unknown"}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {ebook.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    {ebook.price === 0 ? "Free" : `$${ebook.price.toFixed(2)}`}
                  </span>
                  <Badge variant="secondary">{ebook.genre}</Badge>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/browse">
          <Button variant="outline">View All Ebooks</Button>
        </Link>
      </div>
    </section>
  );
}
