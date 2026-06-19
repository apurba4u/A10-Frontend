"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Eye, Trash2, Star } from "lucide-react";
import toast from "react-hot-toast";

const statusConfig = {
  pending: { label: "Pending Approval", variant: "secondary", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  approved: { label: "Approved", variant: "success", className: "bg-green-500/10 text-green-600 dark:text-green-400" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function WriterDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ebooks, setEbooks] = useState([]);
  const [sales, setSales] = useState([]);
  const [salesStats, setSalesStats] = useState({ totalRevenue: 0, totalSales: 0 });
  const [ebookReviewStats, setEbookReviewStats] = useState({});
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [ebooksRes, salesRes] = await Promise.all([
          api.get("/ebooks?limit=50"),
          api.get("/transactions/writer").catch(() => ({ data: { data: { sales: [], stats: {} } } })),
        ]);
        const mine = ebooksRes.data.data.filter(
          (e) => e.writer?._id === user.id || e.writer?.id === user.id
        );
        setEbooks(mine);
        setSales(salesRes.data.data?.sales || []);
        setSalesStats(salesRes.data.data?.stats || {});

        const statsPromises = mine.map((e) =>
          api.get(`/reviews/ebook/${e._id}/stats`).catch(() => ({
            data: { data: { averageRating: 0, reviewCount: 0 } },
          }))
        );
        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        mine.forEach((e, i) => {
          statsMap[e._id] = statsResults[i].data.data;
        });
        setEbookReviewStats(statsMap);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await api.post("/stripe/create-checkout", { type: "verification" });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVerifying(false);
    }
  }

  async function togglePublish(ebookId) {
    try {
      const res = await api.patch(`/ebooks/${ebookId}/publish`);
      setEbooks((prev) => prev.map((e) => (e._id === ebookId ? res.data.data : e)));
      toast.success("Updated");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteEbook(ebookId) {
    if (!confirm("Are you sure you want to delete this ebook?")) return;
    try {
      await api.delete(`/ebooks/${ebookId}`);
      setEbooks((prev) => prev.filter((e) => e._id !== ebookId));
      toast.success("Ebook deleted");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isWriter = user?.role === "writer" || user?.role === "admin";

  if (!isWriter) {
    return (
      <div className="flex max-w-2xl flex-col items-center justify-center py-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">Become a Writer</h1>
        <p className="mt-4 text-muted-foreground">
          Pay a one-time verification fee of $10 to start publishing ebooks on Fable.
        </p>
        <Button onClick={handleVerify} disabled={verifying} className="mt-8" size="lg">
          {verifying ? "Processing..." : "Pay $10 to Verify"}
        </Button>
      </div>
    );
  }

  const pendingCount = ebooks.filter((e) => e.status === "pending").length;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-foreground">Writer Dashboard</h1>
        <Link href="/dashboard/writer/create">
          <Button><Plus className="mr-2 h-4 w-4" /> New Ebook</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${(salesStats.totalRevenue || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">{salesStats.totalSales || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 font-serif text-xl font-semibold text-foreground">My Ebooks</h2>
      <div className="mt-4">
        {ebooks.length === 0 ? (
          <p className="text-muted-foreground">No ebooks yet. Create your first one!</p>
        ) : (
          <div className="space-y-3">
            {ebooks.map((ebook) => {
              const st = statusConfig[ebook.status] || statusConfig.pending;
              return (
                <Card key={ebook._id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{ebook.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ebook.genre} &middot; ${ebook.price.toFixed(2)} &middot; {ebook.soldCount} sold
                        {ebookReviewStats[ebook._id]?.reviewCount > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {ebookReviewStats[ebook._id].averageRating?.toFixed(1)}
                            ({ebookReviewStats[ebook._id].reviewCount})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={st.variant}
                        className={st.className || ""}
                      >
                        {st.label}
                      </Badge>
                      {ebook.status === "approved" && (
                        <Button variant="ghost" size="sm" onClick={() => togglePublish(ebook._id)}>
                          {ebook.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      )}
                      <Link href={`/dashboard/writer/${ebook._id}/edit`}>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      </Link>
                      <Link href={`/ebook/${ebook._id}`}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => deleteEbook(ebook._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <h2 className="mt-8 font-serif text-xl font-semibold text-foreground">Sales History</h2>
      <div className="mt-4">
        {sales.length === 0 ? (
          <p className="text-muted-foreground">No sales yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ebook</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell className="font-medium">{sale.ebook?.title}</TableCell>
                  <TableCell>{sale.user?.email}</TableCell>
                  <TableCell>${sale.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
