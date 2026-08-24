"use client";

import { useState, useMemo, useCallback } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Flag,
  Plus,
  Search,
  AlertTriangle,
  Zap,
  Users,
  RefreshCw,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

// Mock feature flags data
const initialFlags = [
  {
    id: "1",
    key: "ai-assistant",
    description: "Enable AI-powered learning assistant for students",
    enabled: true,
    rolloutPercentage: 100,
    isCritical: false,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    key: "live-sessions",
    description: "Enable real-time video sessions between educators and students",
    enabled: true,
    rolloutPercentage: 75,
    isCritical: false,
    createdAt: "2024-01-08",
    updatedAt: "2024-01-14",
  },
  {
    id: "3",
    key: "stellar-payments",
    description: "Enable Stellar blockchain payment processing",
    enabled: true,
    rolloutPercentage: 100,
    isCritical: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-12",
  },
  {
    id: "4",
    key: "gamification",
    description: "Enable badges, achievements, and learning streaks",
    enabled: false,
    rolloutPercentage: 0,
    isCritical: false,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
  {
    id: "5",
    key: "social-features",
    description: "Enable following educators and social feeds",
    enabled: true,
    rolloutPercentage: 50,
    isCritical: false,
    createdAt: "2024-01-03",
    updatedAt: "2024-01-11",
  },
  {
    id: "6",
    key: "maintenance-mode",
    description: "Put the platform in maintenance mode - CRITICAL",
    enabled: false,
    rolloutPercentage: 0,
    isCritical: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

// Kebab-case validation
const isValidKebabCase = (str) => /^[a-z]+(-[a-z]+)*$/.test(str);

// Format date
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(initialFlags);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loadingFlags, setLoadingFlags] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New flag form state
  const [newFlag, setNewFlag] = useState({
    key: "",
    description: "",
    isCritical: false,
  });
  const [keyError, setKeyError] = useState("");

  // Filter flags based on search
  const filteredFlags = useMemo(() => {
    if (!searchQuery.trim()) return flags;
    const query = searchQuery.toLowerCase();
    return flags.filter(
      (flag) =>
        flag.key.toLowerCase().includes(query) ||
        flag.description.toLowerCase().includes(query)
    );
  }, [flags, searchQuery]);

  // Toggle flag with optimistic update
  const handleToggle = useCallback(async (flagId, currentState) => {
    // Optimistic update
    setFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, enabled: !currentState } : f))
    );
    setLoadingFlags((prev) => ({ ...prev, [flagId]: true }));

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional failure for demo
          if (Math.random() < 0.1) {
            reject(new Error("Failed to update flag"));
          } else {
            resolve();
          }
        }, 500);
      });

      // Update timestamp on success
      setFlags((prev) =>
        prev.map((f) =>
          f.id === flagId
            ? { ...f, updatedAt: new Date().toISOString().split("T")[0] }
            : f
        )
      );
    } catch (error) {
      // Rollback on failure
      setFlags((prev) =>
        prev.map((f) => (f.id === flagId ? { ...f, enabled: currentState } : f))
      );
      console.error("Failed to toggle flag:", error);
    } finally {
      setLoadingFlags((prev) => ({ ...prev, [flagId]: false }));
    }
  }, []);

  // Update rollout percentage
  const handleRolloutChange = useCallback((flagId, percentage) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? {
              ...f,
              rolloutPercentage: percentage[0],
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : f
      )
    );
  }, []);

  // Validate and create new flag
  const handleCreateFlag = useCallback(() => {
    // Validate key format
    if (!isValidKebabCase(newFlag.key)) {
      setKeyError("Key must be in kebab-case (e.g., my-feature-flag)");
      return;
    }

    // Check uniqueness
    if (flags.some((f) => f.key === newFlag.key)) {
      setKeyError("A flag with this key already exists");
      return;
    }

    // Create new flag
    const flag = {
      id: String(Date.now()),
      key: newFlag.key,
      description: newFlag.description,
      enabled: false,
      rolloutPercentage: 0,
      isCritical: newFlag.isCritical,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setFlags((prev) => [flag, ...prev]);
    setNewFlag({ key: "", description: "", isCritical: false });
    setKeyError("");
    setIsCreateOpen(false);
  }, [newFlag, flags]);

  // Refresh flags
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  // Stats
  const enabledCount = flags.filter((f) => f.enabled).length;
  const criticalCount = flags.filter((f) => f.isCritical).length;
  const gradualRolloutCount = flags.filter(
    (f) => f.enabled && f.rolloutPercentage < 100
  ).length;

  return (
    <PageShell>
      <PageHeader
        icon={Flag}
        title="Feature Flags"
        subtitle="Manage feature toggles and gradual rollouts"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              Refresh
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Flag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Feature Flag</DialogTitle>
                  <DialogDescription>
                    Add a new feature flag to control feature availability.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Flag Key</Label>
                    <Input
                      id="key"
                      placeholder="my-feature-flag"
                      value={newFlag.key}
                      onChange={(e) => {
                        setNewFlag((prev) => ({ ...prev, key: e.target.value }));
                        setKeyError("");
                      }}
                      className={keyError ? "border-red-500" : ""}
                    />
                    {keyError && (
                      <p className="text-xs text-red-500">{keyError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Must be lowercase kebab-case (e.g., my-feature)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this flag controls..."
                      value={newFlag.description}
                      onChange={(e) =>
                        setNewFlag((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="critical"
                      checked={newFlag.isCritical}
                      onCheckedChange={(checked) =>
                        setNewFlag((prev) => ({ ...prev, isCritical: checked }))
                      }
                    />
                    <Label htmlFor="critical" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Mark as Critical (Kill Switch)
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFlag} disabled={!newFlag.key}>
                    Create Flag
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className={cn(poppins_600.className, "text-2xl")}>{enabledCount}</p>
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                Active Flags
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className={cn(poppins_600.className, "text-2xl")}>
                {gradualRolloutCount}
              </p>
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                Gradual Rollouts
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className={cn(poppins_600.className, "text-2xl")}>{criticalCount}</p>
              <p className={cn(poppins_400.className, "text-xs text-muted-foreground")}>
                Critical Flags
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search flags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature Flags ({filteredFlags.length})</CardTitle>
          <CardDescription>
            Toggle features and control rollout percentages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Flag Key</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[200px]">Rollout</TableHead>
                  <TableHead className="w-[120px]">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlags.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No feature flags found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlags.map((flag) => (
                    <TableRow
                      key={flag.id}
                      className={cn(
                        flag.isCritical && "bg-red-50/50 hover:bg-red-50"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code
                            className={cn(
                              poppins_500.className,
                              "rounded bg-muted px-2 py-1 text-sm"
                            )}
                          >
                            {flag.key}
                          </code>
                          {flag.isCritical && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Critical
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {flag.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {loadingFlags[flag.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Switch
                              checked={flag.enabled}
                              onCheckedChange={() =>
                                handleToggle(flag.id, flag.enabled)
                              }
                            />
                          )}
                          <Badge
                            variant={flag.enabled ? "default" : "secondary"}
                            className={cn(
                              "text-xs",
                              flag.enabled
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {flag.enabled ? (
                              <Check className="mr-1 h-3 w-3" />
                            ) : (
                              <X className="mr-1 h-3 w-3" />
                            )}
                            {flag.enabled ? "ON" : "OFF"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {flag.rolloutPercentage}% of users
                            </span>
                          </div>
                          <Slider
                            value={[flag.rolloutPercentage]}
                            onValueChange={(val) =>
                              handleRolloutChange(flag.id, val)
                            }
                            max={100}
                            step={5}
                            disabled={!flag.enabled}
                            className="w-full"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(flag.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Usage Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Developer Usage</CardTitle>
          <CardDescription>
            How to consume feature flags in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4">
            <pre className="text-sm overflow-x-auto">
              <code>{`// Import the hook
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

// Use in your component
function MyComponent() {
  const { enabled, loading } = useFeatureFlag("ai-assistant");

  if (loading) return <Skeleton />;
  if (!enabled) return null;

  return <AIAssistant />;
}`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
