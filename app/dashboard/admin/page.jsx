"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Users, BookOpen, ShoppingCart, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import toast from "react-hot-toast";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, totalWriters: 0, totalEbooks: 0, totalRevenue: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [genreDistribution, setGenreDistribution] = useState([]);
  const [users, setUsers] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
