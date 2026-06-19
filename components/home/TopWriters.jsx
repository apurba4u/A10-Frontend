"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export default function TopWriters() {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/ebooks/top-writers");
        setWriters(res.data.data || []);
      } catch {
        setWriters([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="border-y border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-center font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Top Writers
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Meet the talented authors on our platform
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="mt-4 h-5 w-24" />
                <Skeleton className="mt-2 h-4 w-16" />
              </div>
            ))}
          </div>
        ) : writers.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">No writers yet.</p>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {writers.map((writer, i) => (
              <motion.div
                key={writer._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <Avatar className="h-20 w-20">
                  <AvatarImage src={writer.avatar} alt={writer.name} />
                  <AvatarFallback className="text-lg font-serif">
                    {writer.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                  {writer.name}
                </h3>
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {writer.totalSold} books sold
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
