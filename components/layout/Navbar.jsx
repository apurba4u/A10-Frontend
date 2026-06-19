"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { BookOpen, Menu, X, LayoutDashboard, LogOut, User, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function fetchCount() {
      try {
        const res = await api.get("/notifications");
        setUnreadCount(res.data.data?.unreadCount || 0);
      } catch {}
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

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
              <ModeToggle />
              <Link href="/notifications" className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                {({ open, setOpen }) => (
                  <>
                    <DropdownMenuTrigger onClick={() => setOpen(!open)}>
                      <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/30">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="text-xs font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    {open && (
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-medium">{user.name || "User"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="my-1 h-px bg-border" />
                        <DropdownMenuItem onClick={() => setOpen(false)}>
                          <Link href="/dashboard/profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpen(false)}>
                          <Link href="/dashboard" className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <div className="my-1 h-px bg-border" />
                        <DropdownMenuItem
                          onClick={() => {
                            setOpen(false);
                            signOut();
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    )}
                  </>
                )}
              </DropdownMenu>
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
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <Avatar className="h-8 w-8">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
                <Link href="/notifications" className="flex items-center gap-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
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
