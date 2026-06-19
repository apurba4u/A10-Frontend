"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Search } from "lucide-react";
import { GENRES, SORT_OPTIONS } from "../../constants";

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get("genre") || "";

  const [ebooks, setEbooks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState(initialGenre);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genre, sort]);

  useEffect(() => {
    async function fetchEbooks() {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (debouncedSearch) params.search = debouncedSearch;
        if (genre) params.genre = genre;
        const res = await api.get("/ebooks", { params });
        setEbooks(res.data.data);
        setPagination(res.data.pagination);
      } catch {
        setEbooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEbooks();
  }, [page, sort, debouncedSearch, genre]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">Browse Ebooks</h1>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">All Genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : ebooks.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground">No ebooks found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ebooks.map((ebook) => (
              <Link
                key={ebook._id}
                href={`/ebook/${ebook._id}`}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
              >
                {ebook.coverImage ? (
                  <img
                    src={ebook.coverImage}
                    alt={`Cover of ${ebook.title}`}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <span className="text-4xl font-bold text-primary/30 font-serif">
                      {ebook.title.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="mt-3 font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                  {ebook.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  by {ebook.writer?.name || "Unknown"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {ebook.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {ebook.price === 0 ? "Free" : `$${ebook.price.toFixed(2)}`}
                  </span>
                  <Badge variant="secondary">{ebook.genre}</Badge>
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
