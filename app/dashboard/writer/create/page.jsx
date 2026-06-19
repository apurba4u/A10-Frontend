"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { GENRES } from "../../../constants";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEbookSchema } from "../../../validations/ebook";

export default function CreateEbookPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createEbookSchema),
    defaultValues: { genre: "Fiction", price: 0, fullContent: "" },
  });

  async function onSubmit(data) {
    setSaving(true);
    try {
      const res = await api.post("/ebooks", data);
      toast.success("Ebook created!");
      router.push(`/ebook/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Create New Ebook</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <Input {...register("title")} placeholder="Ebook title" />
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe your ebook..."
              />
              {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Full Content</label>
              <textarea
                {...register("fullContent")}
                rows={10}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Write your ebook content here..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Genre</label>
                <select {...register("genre")} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.genre && <p className="mt-1 text-sm text-destructive">{errors.genre.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Price ($)</label>
                <Input type="number" min="0" step="0.01" {...register("price", { valueAsNumber: true })} />
                {errors.price && <p className="mt-1 text-sm text-destructive">{errors.price.message}</p>}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cover Image URL</label>
              <Input {...register("coverImage")} placeholder="https://i.imgur.com/..." />
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
