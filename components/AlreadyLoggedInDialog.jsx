"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, X } from "lucide-react";

export default function AlreadyLoggedInDialog({ open, onClose }) {
  const router = useRouter();
  const { signOut } = useAuth();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-foreground">Already Signed In</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          You are already signed in. What would you like to do?
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={() => {
              onClose();
              router.push("/dashboard");
            }}
            className="w-full gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              signOut();
            }}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out First
          </Button>
        </div>
      </div>
    </div>
  );
}
