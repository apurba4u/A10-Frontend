"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import { BookOpen, Bookmark, Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ purchases: 0, bookmarks: 0, wishlist: 0 });
  const [purchases, setPurchases] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [purchasesRes, bookmarksRes, wishlistRes] = await Promise.all([
          api.get("/transactions/user"),
          api.get("/bookmarks").catch(() => ({ data: { data: [] } })),
          api.get("/wishlist").catch(() => ({ data: { data: [] } })),
        ]);
        setPurchases(purchasesRes.data.data || []);
        setBookmarks(bookmarksRes.data.data || []);
        setWishlist(wishlistRes.data.data || []);
        setStats({
          purchases: purchasesRes.data.data?.length || 0,
          bookmarks: bookmarksRes.data.data?.length || 0,
          wishlist: wishlistRes.data.data?.length || 0,
        });
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="text-lg font-serif">{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.purchases}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Bookmark className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.bookmarks}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.wishlist}</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchases" className="mt-8">
        <TabsList>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card>
            <CardContent className="p-0">
              {purchases.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">No purchases yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell className="font-medium">{p.ebook?.title || "Verification"}</TableCell>
                        <TableCell>{p.type}</TableCell>
                        <TableCell>${p.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "completed" ? "success" : p.status === "pending" ? "secondary" : "destructive"}>
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks">
          {bookmarks.length === 0 ? (
            <p className="text-center text-muted-foreground">No bookmarks yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((b) => (
                <Card key={b._id}>
                  <CardContent className="p-4">
                    <h3 className="font-serif font-semibold">{b.ebook?.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.ebook?.genre}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist">
          {wishlist.length === 0 ? (
            <p className="text-center text-muted-foreground">No wishlist items yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((w) => (
                <Card key={w._id}>
                  <CardContent className="p-4">
                    <h3 className="font-serif font-semibold">{w.ebook?.title}</h3>
                    <p className="text-sm text-muted-foreground">{w.ebook?.genre}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
