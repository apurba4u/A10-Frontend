"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Heart,
  Sparkles,
  Skull,
  Swords,
  User,
  Lightbulb,
  Briefcase,
} from "lucide-react";

const genres = [
  { name: "Fiction", icon: BookOpen, color: "text-blue-500" },
  { name: "Mystery", icon: Search, color: "text-purple-500" },
  { name: "Romance", icon: Heart, color: "text-pink-500" },
  { name: "Sci-Fi", icon: Sparkles, color: "text-cyan-500" },
  { name: "Fantasy", icon: Swords, color: "text-amber-500" },
  { name: "Horror", icon: Skull, color: "text-red-500" },
  { name: "Thriller", icon: Search, color: "text-orange-500" },
  { name: "Biography", icon: User, color: "text-green-500" },
];

export default function GenreGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Browse by Genre
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Find your next favorite read
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
        {genres.map((genre, i) => {
          const Icon = genre.icon;
          return (
            <motion.div
              key={genre.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/browse?genre=${encodeURIComponent(genre.name)}`}
                className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
              >
                <Icon className={`h-8 w-8 ${genre.color} group-hover:scale-110 transition-transform`} />
                <span className="mt-3 font-medium text-foreground">{genre.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
