"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAdminUsers } from "@/lib/actions/admin-user-directory";
import {
  USER_ROLES,
  USER_STATUSES,
  getActiveChips,
  parseUserFilters,
  serializeUserFilters,
} from "@/lib/admin/user-filters";

const SEARCH_DEBOUNCE_MS = 400;
const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export default function UserDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseUserFilters(searchParams), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.q);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const updateFilters = useCallback(
    (patch) => {
      const qs = serializeUserFilters({ ...filtersRef.current, ...patch }).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  // Keep the input in sync when q changes from the URL (chip removal, back/forward).
  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  // Debounce text search into the URL.
  useEffect(() => {
    if (searchInput.trim() === filtersRef.current.q) return;
    const timer = setTimeout(
      () => updateFilters({ q: searchInput }),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchInput, updateFilters]);

  // Fetch on filter change; abort the previous in-flight request.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchAdminUsers(filters, { signal: controller.signal })
      .then((result) => {
        setUsers(result);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.code === "ERR_CANCELED") return;
        setError(err?.message ?? "Failed to load users");
        setLoading(false);
      });
    return () => controller.abort();
  }, [filters]);

  const chips = getActiveChips(filters);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>User directory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            type="search"
            aria-label="Search users"
            placeholder="Search name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`${selectClass} md:col-span-2`}
          />
          <select
            aria-label="Role"
            value={filters.role}
            onChange={(e) => updateFilters({ role: e.target.value })}
            className={selectClass}
          >
            <option value="">All roles</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            aria-label="Status"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className={selectClass}
          >
            <option value="">All statuses</option>
            {USER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              aria-label="Signed up from"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => updateFilters({ from: e.target.value })}
              className={selectClass}
            />
            <input
              type="date"
              aria-label="Signed up to"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => updateFilters({ to: e.target.value })}
              className={selectClass}
            />
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <Badge key={chip.key} variant="secondary" className="gap-1">
                {chip.label}
                <button
                  type="button"
                  aria-label={`Remove ${chip.label} filter`}
                  onClick={() => updateFilters({ [chip.key]: "" })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                updateFilters({ q: "", role: "", status: "", from: "", to: "" })
              }
            >
              Clear all
            </Button>
          </div>
        )}

        {loading && (
          <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
          </div>
        )}
        {!loading && error && (
          <p role="alert" className="text-sm text-destructive">{error}</p>
        )}
        {!loading && !error && users.length === 0 && (
          <p className="text-sm text-muted-foreground">No users match these filters.</p>
        )}
        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-3 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id ?? u.id} className="border-b last:border-0">
                    <td className="px-3 py-3">
                      <p className="font-medium">{u.fullName ?? u.name ?? u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-3 py-3">{u.role}</td>
                    <td className="px-3 py-3">{u.status ?? "active"}</td>
                    <td className="px-3 py-3">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
