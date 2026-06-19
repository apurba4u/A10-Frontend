"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { BookOpen, Menu, X, LayoutDashboard, LogOut, User, Bell, Check, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const notifIcons = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function openNotifications() {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      try {
        const res = await api.get("/notifications?limit=10");
        setNotifications(res.data.data?.notifications || []);
      } catch {}
    }
  }

  async function markAllRead() {
    try {
      await api.put("/notifications/read");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  async function markOneRead(id) {
    try {
      await api.put(`/notifications/${id}/read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {}
  }

  async function deleteOne(id) {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {}
  }

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
          <Link href="/coupons" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Coupons
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
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifications}
                  className="relative text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-background shadow-lg z-50">
                    <div className="flex items-center justify-between border-b border-border p-3">
                      <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`flex items-start gap-3 border-b border-border p-3 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
                          >
                            <span className="mt-0.5 text-lg">{notifIcons[n.type] || "ℹ️"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{n.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {!n.read && (
                                <button
                                  onClick={() => markOneRead(n._id)}
                                  className="rounded p-1 text-muted-foreground hover:bg-accent"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteOne(n._id)}
                                className="rounded p-1 text-muted-foreground hover:bg-accent"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-border p-2">
                      <Link
                        href="/notifications"
                        onClick={() => setShowNotifs(false)}
                        className="block text-center text-xs text-primary hover:underline"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
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
            <Link href="/coupons" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
              Coupons
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
