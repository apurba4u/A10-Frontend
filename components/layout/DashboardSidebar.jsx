"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  PenLine,
  ShoppingCart,
  Heart,
  Bookmark,
  Users,
  Settings,
  BarChart3,
  Ticket,
  Library,
  Bell,
  FileText,
} from "lucide-react";

const userLinks = [
  { href: "/dashboard/user", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/library", label: "My Library", icon: Library },
  { href: "/dashboard/application-status", label: "Application Status", icon: FileText },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const writerLinks = [
  { href: "/dashboard/writer", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/library", label: "My Library", icon: Library },
  { href: "/dashboard/writer/create", label: "New Ebook", icon: PenLine },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/library", label: "My Library", icon: Library },
  { href: "/dashboard/admin", label: "Users", icon: Users },
  { href: "/dashboard/admin", label: "Ebooks", icon: BookOpen },
  { href: "/dashboard/admin", label: "Transactions", icon: ShoppingCart },
  { href: "/dashboard/admin", label: "Coupons", icon: Ticket },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const profileLink = { href: "/dashboard/profile", label: "Profile", icon: Settings };

export default function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  function getLinks() {
    switch (user?.role) {
      case "admin":
        return [...adminLinks, profileLink];
      case "writer":
        return [...writerLinks, profileLink];
      default:
        return [...userLinks, profileLink];
    }
  }

  const links = getLinks();

  return (
    <aside className="hidden w-64 border-r border-border bg-background lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground capitalize">{user?.role || "User"}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isExact = pathname === link.href;
            const isSubPage =
              link.href !== "/dashboard/user" &&
              link.href !== "/dashboard/writer" &&
              link.href !== "/dashboard/admin" &&
              link.href !== "/dashboard/profile" &&
              link.href !== "/dashboard/library" &&
              link.href !== "/dashboard/application-status" &&
              pathname.startsWith(link.href);
            const isActive = isExact || isSubPage;
            return (
              <Link
                key={link.label + link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
