"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../context/AuthContext";
import api from "../../../../../services/api";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import toast from "react-hot-toast";

export default function EditEbookPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "0",
    category: "Uncategorized",
    tags: "",
    cover: "",
    file: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await api.get(`/ebooks/${id}`);
        const ebook = res.data.data;
        if (ebook.author !== user.id && user.role !== "admin") {
          toast.error("Not authorized");
          router.push("/dashboard/writer");
          return;
        }
        setForm({
          title: ebook.title || "",
          description: ebook.description || "",
          price: String(ebook.price || "0"),
          category: ebook.category || "Uncategorized",
          tags: (ebook.tags || []).join(", "),
          cover: ebook.cover || "",
          file: ebook.file || "",
        });
      } catch {
        toast.error("Ebook not found");
        router.push("/dashboard/writer");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, id, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        category: form.category,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        cover: form.cover || null,
        file: form.file || null,
      };
      await api.put(`/ebooks/${id}`, payload);
      toast.success("Ebook updated!");
      router.push(`/ebooks/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Ebook</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={5}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  <option>Uncategorized</option>
                  <option>Technology</option>
                  <option>Fiction</option>
                  <option>Science</option>
                  <option>History</option>
                  <option>Self-Help</option>
                  <option>Business</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cover Image URL</label>
              <Input
                value={form.cover}
                onChange={(e) => setForm({ ...form, cover: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">File URL</label>
              <Input
                value={form.file}
                onChange={(e) => setForm({ ...form, file: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
