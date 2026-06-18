"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../services/api";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

export default function BrowsePage() {
  const [ebooks, setEbooks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (search) params.search = search;
        if (category) params.category = category;
        const res = await api.get("/ebooks", { params });
        setEbooks(res.data.data);
        setPagination(res.data.pagination);
      } catch {
        setEbooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [page, sort, search, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Browse Ebooks</h1>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search ebooks..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Fiction">Fiction</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="Self-Help">Self-Help</option>
          <option value="Business">Business</option>
          <option value="Uncategorized">Uncategorized</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : ebooks.length === 0 ? (
        <p className="mt-12 text-center text-slate-500">No ebooks found.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ebooks.map((ebook) => (
              <Link
                key={ebook._id}
                href={`/ebooks/${ebook._id}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {ebook.cover ? (
                  <img
                    src={ebook.cover}
                    alt={ebook.title}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                    <span className="text-4xl font-bold text-indigo-300">
                      {ebook.title.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-indigo-600">
                  {ebook.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {ebook.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">
                    {ebook.price === 0 ? "Free" : `$${ebook.price.toFixed(2)}`}
                  </span>
                  <Badge>{ebook.category}</Badge>
                </div>
              </Link>
            ))}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
