"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Bookmark, Heart, ShoppingCart, Library, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ purchases: 0, bookmarks: 0, wishlist: 0 });
  const [purchases, setPurchases] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [writerApplication, setWriterApplication] = useState(null);
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
        try {
          const appRes = await api.get("/writer-applications/me");
          setWriterApplication(appRes.data.data);
        } catch {}
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

  const purchasedEbooks = purchases.filter(p => p.type === "purchase" && p.ebook);

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

      {writerApplication && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Writer Status</p>
                <p className="text-xs text-muted-foreground">
                  {writerApplication.status === "pending" && "Your application is pending review."}
                  {writerApplication.status === "approved" && "You are a verified writer."}
                  {writerApplication.status === "rejected" && (writerApplication.rejectionReason
                    ? `Rejected: ${writerApplication.rejectionReason}`
                    : "Your application was not approved.")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={writerApplication.status === "approved" ? "success" : writerApplication.status === "rejected" ? "destructive" : "secondary"}>
                {writerApplication.status === "pending" && "Pending Approval"}
                {writerApplication.status === "approved" && "Verified Writer"}
                {writerApplication.status === "rejected" && "Rejected"}
              </Badge>
              {writerApplication.status === "pending" && (
                <Link href="/dashboard/application-status">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              )}
              {writerApplication.status === "approved" && (
                <Link href="/dashboard/writer">
                  <Button variant="outline" size="sm">Writer Dashboard</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!writerApplication && user?.role === "user" && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Become a Writer</p>
                <p className="text-xs text-muted-foreground">Publish ebooks and earn revenue</p>
              </div>
            </div>
            <Link href="/become-writer">
              <Button variant="outline" size="sm">Apply Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="library" className="mt-8">
        <TabsList>
          <TabsTrigger value="library">My Library</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          {purchasedEbooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Library className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-foreground">Your library is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">Purchase ebooks to start building your collection</p>
                <Link href="/browse" className="mt-4">
                  <Button>Browse Ebooks</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {purchasedEbooks.map((p) => (
                <Card key={p._id} className="overflow-hidden transition-all hover:shadow-md">
                  {p.ebook?.coverImage ? (
                    <img
                      src={p.ebook.coverImage}
                      alt={p.ebook.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-4xl font-bold text-primary/30 font-serif">
                        {p.ebook?.title?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-serif font-semibold text-foreground line-clamp-1">{p.ebook?.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">by {p.ebook?.writer?.name || "Unknown"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Purchased {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                    <Link href={`/reader/${p.ebook?._id}`} className="mt-3 block">
                      <Button className="w-full gap-2" size="sm">
                        <BookOpen className="h-4 w-4" />
                        Read Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

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
