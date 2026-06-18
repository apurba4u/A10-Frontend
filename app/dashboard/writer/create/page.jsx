"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import toast from "react-hot-toast";

export default function CreateEbookPage() {
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

  if (!authLoading && !user) router.push("/login");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        category: form.category,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim())
          : [],
        cover: form.cover || null,
        file: form.file || null,
      };
      const res = await api.post("/ebooks", payload);
      toast.success("Ebook created!");
      router.push(`/ebooks/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Ebook</CardTitle>
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
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
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
              <label className="mb-1 block text-sm font-medium">
                Tags (comma-separated)
              </label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="fiction, fantasy, adventure"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Cover Image URL
              </label>
              <Input
                value={form.cover}
                onChange={(e) => setForm({ ...form, cover: e.target.value })}
                placeholder="https://i.ibb.co/..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                File URL
              </label>
              <Input
                value={form.file}
                onChange={(e) => setForm({ ...form, file: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Creating..." : "Create Ebook"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
