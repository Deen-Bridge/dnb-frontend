"use client";

import { useState } from "react";
import Link from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CreditCard,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const groups = [
  {
    label: "Workspace",
    links: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Educators", href: "/admin/educators", icon: GraduationCap },
      { label: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
    ],
  },
  {
    label: "Content",
    links: [
      { label: "Courses", href: "/admin/courses", icon: GraduationCap },
      { label: "Books", href: "/admin/books", icon: BookOpen },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Spaces", href: "/admin/spaces", icon: Activity },
      { label: "Reels", href: "/admin/reels", icon: Activity },
    ],
  },
  {
    label: "Insights & operations",
    links: [
      { label: "Analytics", href: "/admin/analytics/revenue", icon: BarChart3 },
      { label: "Transactions", href: "/admin/transactions", icon: CreditCard },
      { label: "Reconciliation", href: "/admin/reconciliation", icon: CreditCard },
      { label: "Disputes", href: "/admin/payments/disputes", icon: ShieldCheck },
      { label: "Activity monitor", href: "/admin/activity-monitor", icon: Activity },
    ],
  },
  {
    label: "Administration",
    links: [
      { label: "Announcements", href: "/admin/announcements", icon: Bell },
      { label: "Emails", href: "/admin/emails", icon: Mail },
      { label: "Audit logs", href: "/admin/audit-logs", icon: ShieldCheck },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

function NavigationLinks({ onNavigate }) {
  const pathname = usePathname() || "";
  const currentPath = pathname;

  return (
    <nav aria-label="Admin navigation" className="space-y-6">
      {groups.map((group) => (
        <section key={group.label}>
          <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h2>
          <ul className="space-y-1">
            {group.links.map(({ label, href, icon: Icon }) => {
              const active = href === "/admin"
                ? currentPath === href
                : currentPath === href || currentPath.startsWith(`${href}/`);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}

export default function AdminNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        <div className="sticky top-0 max-h-screen overflow-y-auto px-3 py-6">
          <p className="mb-6 px-3 text-lg font-semibold">Admin</p>
          <NavigationLinks />
        </div>
      </aside>

      <div className="flex items-center gap-3 border-b px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open admin navigation">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Admin navigation</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <NavigationLinks onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-semibold">Admin</span>
      </div>
    </>
  );
}
