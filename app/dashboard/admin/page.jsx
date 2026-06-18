"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Users, BookOpen, ShoppingCart } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, ebooks: 0, revenue: 0 });

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user && user.role !== "admin") router.push("/dashboard");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    async function load() {
      try {
        const [ebooksRes, purchasesRes] = await Promise.all([
          api.get("/ebooks?limit=1"),
          api.get("/payments/history"),
        ]);
        const purchases = purchasesRes.data?.data || [];
        const revenue = purchases
          .filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        setStats({
          ebooks: ebooksRes.data?.pagination?.total || 0,
          users: 0,
          revenue,
        });
      } catch {}
    }
    load();
  }, [user]);

  if (authLoading || !user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.users}</p>
          </CardContent>
        </Card>
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
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
