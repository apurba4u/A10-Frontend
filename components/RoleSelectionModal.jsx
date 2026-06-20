"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, PenLine } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function RoleSelectionModal({ open, onSelect }) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSelect(role) {
    setLoading(true);
    try {
      await api.put("/auth/role", { role });
      toast.success(
        role === "writer"
          ? "You're now a writer! You can start publishing ebooks."
          : "Welcome! Start exploring ebooks."
      );
      if (onSelect) onSelect(role);
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-2xl">
        <h2 className="font-serif text-2xl font-bold text-foreground text-center">
          Welcome to Fable
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          How would you like to use Fable?
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => handleSelect("user")}
            disabled={loading}
            className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md disabled:opacity-50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Read Ebooks
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse, purchase, and read ebooks from talented writers
            </p>
          </button>

          <button
            onClick={() => handleSelect("writer")}
            disabled={loading}
            className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md disabled:opacity-50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <PenLine className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              Write & Publish
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish your own ebooks and reach readers worldwide
            </p>
          </button>
        </div>

        {loading && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
}
