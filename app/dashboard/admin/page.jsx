"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, ShoppingCart, DollarSign, Tag, ChevronDown, ChevronUp, Star } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20).toUpperCase(),
  discountPercent: z.number().min(1, "Min 1%").max(100, "Max 100%"),
  usageLimit: z.number().min(1, "Min 1"),
  minPurchaseAmount: z.number().min(0, "Cannot be negative"),
});

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, totalWriters: 0, totalEbooks: 0, totalRevenue: 0, couponUsageCount: 0, totalCouponDiscount: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [genreDistribution, setGenreDistribution] = useState([]);
  const [users, setUsers] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [writerApps, setWriterApps] = useState([]);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/dashboard");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    async function load() {
      try {
        const [analytics, revenue, usersRes, ebooksRes, transactionsRes] = await Promise.all([
          api.get("/admin/analytics/overview"),
          api.get("/admin/analytics/revenue"),
          api.get("/admin/users"),
          api.get("/admin/ebooks"),
          api.get("/admin/transactions"),
        ]);
        setStats(analytics.data.data);
        setMonthlyRevenue(revenue.data.data);
        setGenreDistribution(analytics.data.data.genreDistribution || []);
        setUsers(usersRes.data.data);
        setEbooks(ebooksRes.data.data);
        setTransactions(transactionsRes.data.data);
        const couponsRes = await api.get("/coupons");
        setCoupons(couponsRes.data.data);
        const reviewsRes = await api.get("/admin/reviews");
        setReviews(reviewsRes.data.data);
        const writerAppsRes = await api.get("/writer-applications");
        setWriterApps(writerAppsRes.data.data);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function updateUserRole(userId, role) {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role } : u)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function togglePublishEbook(ebookId) {
    try {
      const res = await api.patch(`/admin/ebooks/${ebookId}/publish`);
      setEbooks((prev) => prev.map((e) => (e._id === ebookId ? res.data.data : e)));
      toast.success("Updated");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteEbook(ebookId) {
    if (!confirm("Are you sure you want to delete this ebook?")) return;
    try {
      await api.delete(`/admin/ebooks/${ebookId}`);
      setEbooks((prev) => prev.filter((e) => e._id !== ebookId));
      toast.success("Ebook deleted");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleRejectApplication() {
    if (!rejectingApp) return;
    try {
      await api.post(`/writer-applications/${rejectingApp._id}/reject`, { rejectionReason: rejectReason || "" });
      setWriterApps((prev) => prev.map((a) => a._id === rejectingApp._id ? { ...a, status: "rejected" } : a));
      toast.success("Application rejected");
      setRejectingApp(null);
      setRejectReason("");
    } catch (err) {
      toast.error(err.message);
    }
  }

  const {
    register: registerCoupon,
    handleSubmit: handleCouponSubmit,
    reset: resetCouponForm,
    formState: { errors: couponErrors },
  } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: "", discountPercent: 10, usageLimit: 10, minPurchaseAmount: 0 },
  });

  async function onCreateCoupon(data) {
    setCouponLoading(true);
    try {
      const res = await api.post("/coupons", data);
      setCoupons((prev) => [...prev, res.data.data]);
      resetCouponForm();
      setShowCouponForm(false);
      toast.success("Coupon created");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCouponLoading(false);
    }
  }

  async function deleteCoupon(couponId) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      toast.success("Coupon deleted");
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

  return (
    <div className="max-w-7xl">
      <h1 className="font-serif text-2xl font-bold text-foreground">Admin Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalUsers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Total Writers</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalWriters}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Total Ebooks</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalEbooks}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Coupon Uses</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.couponUsageCount || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">${(stats.totalCouponDiscount || 0).toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No revenue data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Genre Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {genreDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genreDistribution}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genreDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No genre data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="mt-8">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="ebooks">Ebooks</TabsTrigger>
          <TabsTrigger value="ebook-approvals">Ebook Approvals</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="writer-apps">Writer Apps</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u._id, e.target.value)}
                          className="rounded border border-input bg-background px-2 py-1 text-sm"
                        >
                          <option value="user">User</option>
                          <option value="writer">Writer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => deleteUser(u._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ebooks">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ebooks.map((e) => (
                    <TableRow key={e._id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>{e.writer?.name}</TableCell>
                      <TableCell>${e.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={e.isPublished ? "success" : "secondary"}>
                          {e.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => togglePublishEbook(e._id)}>
                            {e.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteEbook(e._id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ebook-approvals">
          <Card>
            <CardContent className="p-0">
              {ebooks.filter((e) => e.status === "pending").length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">No pending ebook approvals.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cover</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Writer</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ebooks.filter((e) => e.status === "pending").map((e) => (
                      <TableRow key={e._id}>
                        <TableCell>
                          {e.coverImage ? (
                            <img src={e.coverImage} alt="" className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                              {e.title.charAt(0)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{e.title}</TableCell>
                        <TableCell>{e.writer?.name || "Unknown"}</TableCell>
                        <TableCell>{e.genre}</TableCell>
                        <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await api.post(`/ebooks/${e._id}/approve`);
                                  setEbooks((prev) => prev.map((x) => x._id === e._id ? { ...x, status: "approved", isPublished: true } : x));
                                  toast.success("Ebook approved");
                                } catch (err) {
                                  toast.error(err.message);
                                }
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await api.post(`/ebooks/${e._id}/reject`);
                                  setEbooks((prev) => prev.map((x) => x._id === e._id ? { ...x, status: "rejected", isPublished: false } : x));
                                  toast.success("Ebook rejected");
                                } catch (err) {
                                  toast.error(err.message);
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Ebook</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>
                        <Badge variant={t.type === "purchase" ? "default" : "secondary"}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.user?.email}</TableCell>
                      <TableCell>{t.ebook?.title || "N/A"}</TableCell>
                      <TableCell>${t.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5" />
                Manage Coupons
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCouponForm(!showCouponForm)}
              >
                {showCouponForm ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
                Create Coupon
              </Button>
            </CardHeader>
            <CardContent>
              {showCouponForm && (
                <form onSubmit={handleCouponSubmit(onCreateCoupon)} className="mb-6 space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Code</label>
                      <Input placeholder="e.g. SAVE20" {...registerCoupon("code")} />
                      {couponErrors.code && (
                        <p className="mt-1 text-xs text-destructive">{couponErrors.code.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Discount %</label>
                      <Input type="number" {...registerCoupon("discountPercent", { valueAsNumber: true })} />
                      {couponErrors.discountPercent && (
                        <p className="mt-1 text-xs text-destructive">{couponErrors.discountPercent.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Usage Limit</label>
                      <Input type="number" {...registerCoupon("usageLimit", { valueAsNumber: true })} />
                      {couponErrors.usageLimit && (
                        <p className="mt-1 text-xs text-destructive">{couponErrors.usageLimit.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Min Purchase ($)</label>
                      <Input type="number" step="0.01" {...registerCoupon("minPurchaseAmount", { valueAsNumber: true })} />
                      {couponErrors.minPurchaseAmount && (
                        <p className="mt-1 text-xs text-destructive">{couponErrors.minPurchaseAmount.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={couponLoading}>
                      {couponLoading ? "Creating..." : "Create Coupon"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCouponForm(false); resetCouponForm(); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Min Purchase</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((c) => {
                    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                    return (
                      <TableRow key={c._id}>
                        <TableCell className="font-mono font-semibold uppercase">{c.code}</TableCell>
                        <TableCell>{c.discountPercent}%</TableCell>
                        <TableCell>{c.usedCount}/{c.usageLimit}</TableCell>
                        <TableCell>${c.minPurchaseAmount?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>
                          {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isExpired ? "destructive" : c.isActive ? "success" : "secondary"}>
                            {isExpired ? "Expired" : c.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => deleteCoupon(c._id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {coupons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No coupons created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="writer-apps">
          <Card>
            <CardContent className="p-0">
              {writerApps.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">No writer applications yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {writerApps.map((app) => (
                      <TableRow key={app._id}>
                        <TableCell className="font-medium">{app.user?.name || "Unknown"}</TableCell>
                        <TableCell>{app.user?.email || "Unknown"}</TableCell>
                        <TableCell>${app.paymentAmount?.toFixed(2) || "10.00"}</TableCell>
                        <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={app.status === "approved" ? "success" : app.status === "rejected" ? "destructive" : "secondary"}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {app.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await api.post(`/writer-applications/${app._id}/approve`);
                                    setWriterApps((prev) => prev.map((a) => a._id === app._id ? { ...a, status: "approved" } : a));
                                    toast.success("Application approved");
                                  } catch (err) {
                                    toast.error(err.message);
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRejectingApp(app)}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {app.status === "approved" ? "Approved" : "Rejected"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-0">
              {reviews.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">No reviews yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Ebook</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell>{r.user?.name || "Unknown"}</TableCell>
                        <TableCell>{r.ebook?.title || "Unknown"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">{r.comment || "-"}</TableCell>
                        <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (!confirm("Delete this review?")) return;
                              try {
                                await api.delete(`/admin/reviews/${r._id}`);
                                setReviews((prev) => prev.filter((rv) => rv._id !== r._id));
                                toast.success("Review deleted");
                              } catch (err) {
                                toast.error(err.message);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {rejectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
            <h3 className="font-serif text-lg font-bold text-foreground">Reject Application</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Rejecting {rejectingApp.user?.name || "Unknown"}&apos;s writer application. A refund will be issued.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setRejectingApp(null); setRejectReason(""); }}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRejectApplication}>
                Reject Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
