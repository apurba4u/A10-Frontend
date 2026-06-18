"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { BookOpen, BookmarkCheck, ShoppingCart } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({ ebooks: 0, bookmarks: 0, purchases: 0 });

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [purchasesRes, ebooksRes, bookmarksRes] = await Promise.all([
          api.get("/payments/history"),
          api.get("/ebooks?limit=1").catch(() => ({ data: { pagination: { total: 0 } } })),
          api.get("/bookmarks").catch(() => ({ data: { data: [] } })),
        ]);
        setPurchases(purchasesRes.data.data || []);
        setStats({
          ebooks: ebooksRes.data?.pagination?.total || 0,
          bookmarks: bookmarksRes.data?.data?.length || 0,
          purchases: purchasesRes.data?.data?.length || 0,
        });
      } catch {}
    }
    load();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-slate-500">
        Welcome back, {user.name || user.email}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-sm font-medium">Ebooks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.ebooks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <BookmarkCheck className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.bookmarks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.purchases}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex gap-4">
        {user.role === "writer" || user.role === "admin" ? (
          <Link href="/dashboard/writer">
            <Button>Writer Dashboard</Button>
          </Link>
        ) : (
          <Link href="/dashboard/writer">
            <Button variant="outline">Become a Writer</Button>
          </Link>
        )}
        {user.role === "admin" && (
          <Link href="/dashboard/admin">
            <Button variant="outline">Admin Panel</Button>
          </Link>
        )}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-slate-900">
        Recent Purchases
      </h2>
      <div className="mt-4 space-y-3">
        {purchases.length === 0 ? (
          <p className="text-sm text-slate-500">No purchases yet.</p>
        ) : (
          purchases.slice(0, 5).map((p) => (
            <Card key={p._id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">
                    {p.ebook?.title || "Writer Verification"}
                  </p>
                  <p className="text-sm text-slate-500">
                    ${p.amount.toFixed(2)} &middot;{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    p.status === "completed"
                      ? "text-green-600"
                      : p.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {p.status}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
