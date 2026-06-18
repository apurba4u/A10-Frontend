"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Plus, Edit, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function WriterDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ebooks, setEbooks] = useState([]);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await api.get("/ebooks?limit=50");
        const mine = res.data.data.filter((e) => e.author === user.id);
        setEbooks(mine);
      } catch {}
    }
    load();
  }, [user]);

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await api.post("/payments/verify-writer");
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
      setEbooks((prev) =>
        prev.map((e) =>
          e._id === ebookId ? res.data.data : e
        )
      );
      toast.success("Updated");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (authLoading || !user) return null;

  const isWriter = user.role === "writer" || user.role === "admin";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isWriter ? "Writer Dashboard" : "Become a Writer"}
          </h1>
          {!isWriter && (
            <p className="mt-2 text-slate-500">
              Pay a one-time verification fee to start publishing ebooks.
            </p>
          )}
        </div>
        {isWriter ? (
          <Link href="/dashboard/writer/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Ebook
            </Button>
          </Link>
        ) : (
          <Button onClick={handleVerify} disabled={verifying}>
            {verifying ? "Processing..." : "Verify ($9.99)"}
          </Button>
        )}
      </div>

      {isWriter && (
        <div className="mt-8 space-y-4">
          {ebooks.length === 0 ? (
            <p className="text-slate-500">
              You haven&apos;t created any ebooks yet.
            </p>
          ) : (
            ebooks.map((ebook) => (
              <Card key={ebook._id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">{ebook.title}</p>
                    <p className="text-sm text-slate-500">
                      {ebook.category} &middot; ${ebook.price.toFixed(2)} &middot;{" "}
                      {ebook.purchaseCount} purchases
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={ebook.isPublished ? "success" : "secondary"}
                    >
                      {ebook.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(ebook._id)}
                    >
                      {ebook.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Link href={`/dashboard/writer/${ebook._id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/ebooks/${ebook._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
