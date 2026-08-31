"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { fetchAdminOverview } from "@/lib/actions/admin-overview";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRightLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkle,
  X,
  Rocket,
  AlertTriangle,
} from "lucide-react";

// Persisted in localStorage so the bootstrap guidance can be dismissed
// permanently once the team is actively using the platform.
const DISMISS_STORAGE_KEY = "dnb-bootstrap-dismissed";

// Overview widgets. Each one renders a guided hint (and a CTA) while its count
// is zero, and the real value once data exists — hints disappear naturally as
// the database fills up. Presentational config only; counts come from the
// snapshot service.
const OVERVIEW_WIDGETS = [
  {
    key: "mentors",
    icon: Users,
    href: "/dashboard/admin/team",
    hint: "Invite your first mentor",
    description: "Mentors lead courses and guide learners.",
    cta: "Invite mentors",
  },
  {
    key: "categories",
    icon: FolderTree,
    href: "/dashboard/courses/categories",
    hint: "Create a category",
    description: "Organise courses into browsable categories.",
    cta: "Create category",
  },
  {
    key: "courses",
    icon: GraduationCap,
    href: "/dashboard/courses/create",
    hint: "Publish your first course",
    description: "Share knowledge with structured lessons.",
    cta: "Create course",
  },
  {
    key: "books",
    icon: BookOpen,
    href: "/admin/books",
    hint: "Add books to the library",
    description: "Curate authentic titles for readers.",
    cta: "Add books",
  },
  {
    key: "students",
    icon: Sparkles,
    href: "/dashboard",
    hint: "Invite your first students",
    description: "Learners sign up to browse courses and books.",
    cta: "View dashboard",
  },
  {
    key: "transactions",
    icon: ArrowRightLeft,
    href: "/admin/transactions",
    hint: "Complete your first sale",
    description: "Transactions appear here as learners purchase.",
    cta: "View transactions",
  },
];

// Setup checklist. Completion is data-driven: either a settings value is
// configured or a real count is above zero, so items complete on their own as
// the platform is set up.
const SETUP_ITEMS = [
  {
    key: "platformName",
    label: "Set your platform name",
    href: "/admin/settings/branding",
    complete: (snapshot) => snapshot.settings.platformName.configured,
  },
  {
    key: "firstCategory",
    label: "Create a category",
    href: "/dashboard/courses/categories",
    complete: (snapshot) => snapshot.counts.categories.value > 0,
  },
  {
    key: "firstMentor",
    label: "Invite your first mentor",
    href: "/dashboard/admin/team",
    complete: (snapshot) => snapshot.counts.mentors.value > 0,
  },
  {
    key: "firstCourse",
    label: "Publish your first course",
    href: "/dashboard/courses/create",
    complete: (snapshot) => snapshot.counts.courses.value > 0,
  },
  {
    key: "libraryBooks",
    label: "Add books to the library",
    href: "/admin/books",
    complete: (snapshot) => snapshot.counts.books.value > 0,
  },
  {
    key: "paymentSettings",
    label: "Configure payment settings",
    href: "/admin/settings",
    complete: (snapshot) => snapshot.settings.paymentSettings.configured,
  },
];

function OverviewWidget({ widget, metric, guided }) {
  const Icon = widget.icon;
  const isEmpty = metric.value === 0;

  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p
              className={cn(
                poppins_500.className,
                "text-xs uppercase tracking-wider text-muted-foreground"
              )}
            >
              {metric.label}
            </p>
            {isEmpty && guided ? (
              <>
                <p className={cn(poppins_600.className, "text-lg text-foreground")}>
                  {widget.hint}
                </p>
                <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                  {widget.description}
                </p>
              </>
            ) : (
              <p className={cn(poppins_600.className, "text-3xl text-foreground")}>
                {metric.value.toLocaleString()}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10",
              isEmpty && guided && "animate-pulse"
            )}
          >
            <Icon className="h-5 w-5 text-accent" />
          </div>
        </div>
        {isEmpty && guided && (
          <Link
            href={widget.href}
            className={cn(
              poppins_500.className,
              "mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
            )}
          >
            {widget.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/10 bg-gradient-to-br from-secondary/15 via-highlight/10 to-accent/10 p-6 sm:p-8">
      <div className="relative z-10 max-w-2xl space-y-3">
        <Badge variant="outline" className="gap-1.5">
          <Sparkle className="h-3 w-3" />
          Fresh deployment
        </Badge>
        <h2 className={cn(poppins_600.className, "text-2xl text-foreground")}>
          Welcome to your new platform
        </h2>
        <p className={cn(poppins_400.className, "text-sm text-muted-foreground")}>
          Your database is empty — that&apos;s expected. The cards below show
          guided next steps instead of confusing zeros, and the checklist tracks
          your setup progress as you go.
        </p>
      </div>
    </div>
  );
}

function SetupChecklist({ items, completedCount, progress, onDismiss }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rocket className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Finish these steps to launch your platform
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dismiss setup guide forever"
            title="Dismiss setup guide forever"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Setup progress</span>
            <span className={cn(poppins_600.className, "text-foreground")}>
              {completedCount}/{items.length} complete
            </span>
          </div>
          <Progress value={progress} aria-label="Setup progress" />
        </div>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                {item.complete ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                )}
                <span
                  className={cn(
                    poppins_400.className,
                    "text-sm text-foreground",
                    item.complete && "text-muted-foreground line-through"
                  )}
                >
                  {item.label}
                </span>
                {!item.complete && (
                  <span
                    className={cn(
                      poppins_500.className,
                      "ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent"
                    )}
                  >
                    Start
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Progress is derived from your platform data and settings. Dismiss this
          guide once your team is actively using the platform.
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;

    try {
      if (window.localStorage.getItem(DISMISS_STORAGE_KEY) === "true") {
        setDismissed(true);
      }
    } catch {
      // storage unavailable — treat as not dismissed
    }

    fetchAdminOverview()
      .then((overview) => {
        if (active) {
          setData(overview);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load overview");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const dismissForever = () => {
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, "true");
    } catch {
      // storage unavailable — dismissal stays session-only
    }
    setDismissed(true);
  };

  const setupItems = useMemo(() => {
    if (!data) return [];
    return SETUP_ITEMS.map((item) => ({
      ...item,
      complete: item.complete(data),
    }));
  }, [data]);

  const completedCount = setupItems.filter((item) => item.complete).length;
  const progress = setupItems.length
    ? Math.round((completedCount / setupItems.length) * 100)
    : 0;

  if (loading) {
    return (
      <PageShell>
        <PageHeader
          icon={LayoutDashboard}
          title="Overview"
          subtitle="Monitor platform activity and complete your setup"
        />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <PageHeader
          icon={LayoutDashboard}
          title="Overview"
          subtitle="Monitor platform activity and complete your setup"
        />
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load overview"
          description={error}
        />
      </PageShell>
    );
  }

  const isEmpty = data.empty;
  const guided = !dismissed;

  return (
    <PageShell>
      <PageHeader
        icon={LayoutDashboard}
        title="Overview"
        subtitle="Monitor platform activity and complete your setup"
      />

      {isEmpty && guided && <WelcomeBanner />}

      {/* Overview widgets — guided hints instead of zeros on a fresh database */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OVERVIEW_WIDGETS.map((widget) => (
          <OverviewWidget
            key={widget.key}
            widget={widget}
            metric={data.counts[widget.key]}
            guided={guided}
          />
        ))}
      </div>

      {/* Setup checklist — completion derived from data + settings values */}
      {guided && (
        <SetupChecklist
          items={setupItems}
          completedCount={completedCount}
          progress={progress}
          onDismiss={dismissForever}
        />
      )}
    </PageShell>
  );
}
