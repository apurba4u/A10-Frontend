"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { ModeToggle } from "../ModeToggle";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-serif">Fable</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Browse
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/bookmarks" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Bookmarks
              </Link>
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
              <ModeToggle />
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <ModeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <Link href="/browse" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/bookmarks" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Bookmarks
                </Link>
                <div className="flex items-center gap-2">
                  <ModeToggle />
                  <Button variant="outline" size="sm" onClick={() => { signOut(); setMobileOpen(false); }}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <ModeToggle />
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
