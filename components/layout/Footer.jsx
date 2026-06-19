"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen } from "lucide-react";

export default function Footer() {
  const { user } = useAuth();
  const router = useRouter();

  function handleStartWriting(e) {
    e.preventDefault();
    if (!user) {
      router.push("/register");
    } else if (user.role === "writer" || user.role === "admin") {
      router.push("/dashboard/writer");
    } else {
      router.push("/become-writer");
    }
  }

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-serif">Fable</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              A community-driven platform for writers and readers to discover and share original ebooks.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Browse Ebooks
                </Link>
              </li>
              <li>
                <a href="#" onClick={handleStartWriting} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Start Writing
                </a>
              </li>
              <li>
                <Link href="/coupons" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Coupons
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fable. All rights reserved. Created by Apurba Ovi
          </p>
        </div>
      </div>
    </footer>
  );
}
