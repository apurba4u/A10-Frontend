"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../../services/api";
import { useAuth } from "../../../../../context/AuthContext";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { GENRES } from "../../../../../constants";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEbookSchema } from "../../../../../validations/ebook";

export default function EditEbookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateEbookSchema),
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/ebooks/${id}`);
        const ebook = res.data.data;
        if (ebook.writer?._id !== user?.id && user?.role !== "admin") {
          toast.error("Not authorized");
          router.push("/dashboard/writer");
          return;
        }
        reset({
          title: ebook.title,
          description: ebook.description,
          fullContent: ebook.fullContent || "",
          genre: ebook.genre,
          price: ebook.price,
          coverImage: ebook.coverImage || "",
        });
      } catch {
        toast.error("Ebook not found");
        router.push("/dashboard/writer");
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [id, user, router, reset]);

  async function onSubmit(data) {
    setSaving(true);
    try {
      await api.put(`/ebooks/${id}`, data);
      toast.success("Ebook updated!");
      router.push(`/ebook/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Edit Ebook</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <Input {...register("title")} />
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Full Content</label>
              <textarea
                {...register("fullContent")}
                rows={10}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Genre</label>
                <select {...register("genre")} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Price ($)</label>
                <Input type="number" min="0" step="0.01" {...register("price", { valueAsNumber: true })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cover Image URL</label>
              <Input {...register("coverImage")} />
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
