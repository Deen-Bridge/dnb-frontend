"use client";

import { use, useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Printer,
  User,
  Wallet,
  ExternalLink,
  Activity,
  Clock,
  FileCheck,
} from "lucide-react";
import { getUserById } from "@/lib/actions/users/getUserById";
import { fetchEducatorVerificationHistory } from "@/lib/actions/admin-verification-history";
import { getExplorerUrl } from "@/lib/utils/stellarExplorer";
import { config } from "@/lib/config/env";
import { cn } from "@/lib/utils";

const VERIFICATION_BADGE_STYLES = {
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  info_requested: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  re_verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

function isMentorRecord(user) {
  const role = String(user?.role || "").toLowerCase();
  return role === "educator" || role === "mentor";
}

function formatVerificationTimestamp(timestamp) {
  if (!timestamp) return "Timestamp unavailable";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Timestamp unavailable";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUserDetailPage({ params }) {
  const { userId } = use(params);
  const [user, setUser] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState({
    source: null,
    events: [],
    loading: true,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadUser() {
      setLoading(true);
      try {
        const res = await getUserById(userId);
        if (!isActive) return;
        let resolvedUser;
        if (res?.user) {
          resolvedUser = res.user;
        } else {
          // Mock fallback user record if backend endpoint is not connected
          resolvedUser = {
            _id: userId,
            name: "Amina Yusuf",
            email: "amina@deenbridge.org",
            role: "educator",
            status: "active",
            createdAt: "2025-01-15T10:30:00Z",
            walletAddress: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
            bio: "Senior Arabic & Quranic Studies Educator at DeenBridge.",
            coursesCount: 8,
            booksCount: 3,
            verification: {
              submittedAt: "2025-01-16T09:00:00Z",
              reviewedAt: "2025-01-17T14:30:00Z",
              approvedAt: "2025-01-17T14:30:00Z",
              reviewedBy: "Admin review team",
            },
            purchases: [
              { id: "p1", title: "Tafsir of Surah Al-Fatihah", amount: "$24.50", date: "2026-01-10" },
              { id: "p2", title: "The Sealed Nectar", amount: "$9.99", date: "2026-02-01" },
            ],
          };
        }
        setUser(resolvedUser);

        if (isMentorRecord(resolvedUser)) {
          try {
            const history = await fetchEducatorVerificationHistory(userId, resolvedUser);
            if (!isActive) return;
            setVerificationHistory({
              source: history.source,
              events: Array.isArray(history.events) ? history.events : [],
              loading: false,
              error: null,
            });
          } catch (err) {
            if (!isActive) return;
            setVerificationHistory({
              source: null,
              events: [],
              loading: false,
              error: err?.message || "Failed to load verification history",
            });
          }
        } else {
          setVerificationHistory({ source: null, events: [], loading: false, error: null });
        }
      } catch {
        if (!isActive) return;
        const fallbackUser = {
          _id: userId,
          name: "Amina Yusuf",
          email: "amina@deenbridge.org",
          role: "educator",
          status: "active",
          createdAt: "2025-01-15T10:30:00Z",
          walletAddress: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
          bio: "Senior Arabic & Quranic Studies Educator at DeenBridge.",
          coursesCount: 8,
          booksCount: 3,
          verification: {
            submittedAt: "2025-01-16T09:00:00Z",
            reviewedAt: "2025-01-17T14:30:00Z",
            approvedAt: "2025-01-17T14:30:00Z",
            reviewedBy: "Admin review team",
          },
          purchases: [
            { id: "p1", title: "Tafsir of Surah Al-Fatihah", amount: "$24.50", date: "2026-01-10" },
            { id: "p2", title: "The Sealed Nectar", amount: "$9.99", date: "2026-02-01" },
          ],
        };
        setUser(fallbackUser);
        const history = await fetchEducatorVerificationHistory(userId, fallbackUser);
        if (!isActive) return;
        setVerificationHistory({
          source: history.source,
          events: Array.isArray(history.events) ? history.events : [],
          loading: false,
          error: null,
        });
      } finally {
        if (isActive) setLoading(false);
      }
    }
    loadUser();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const handlePrint = () => {
    window.print();
  };

  const network = config.stellarNetwork;
  const explorerUrl = user?.walletAddress
    ? getExplorerUrl(user.walletAddress, network)
    : null;

  return (
    <PageShell>
      <div className="print-root space-y-6">
        {/* Page Header with Print Button */}
        <PageHeader
          icon={User}
          title="User Record Detail"
          subtitle={`Admin record summary for user ID: ${userId}`}
          actions={
            <div className="no-print flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2 font-semibold"
                aria-label="Print record"
              >
                <Printer className="h-4 w-4" />
                Print Record
              </Button>
            </div>
          }
        />

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading user record...</div>
        ) : !user ? (
          <div className="p-8 text-center text-muted-foreground">User record not found.</div>
        ) : (
          <>
            {/* User Primary Overview Card */}
            <Card className="border shadow-none">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border">
                      <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize font-semibold">
                          {user.role || "student"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "capitalize font-medium",
                            user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100"
                          )}
                        >
                          {user.status || "active"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 sm:text-right">
                    <p>
                      System ID: <span className="font-mono font-semibold">{user._id}</span>
                    </p>
                    <p>
                      Joined Date:{" "}
                      <span className="font-semibold">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Profile Links & Bio */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium mb-1">
                      Public Profile Link:
                    </span>
                    <a
                      href={`/educators/${user._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold print-url inline-flex items-center gap-1"
                    >
                      View Public Educator Page
                      <ExternalLink className="h-3 w-3 no-print" />
                    </a>
                  </div>

                  <div>
                    <span className="text-muted-foreground block font-medium mb-1">
                      Contact Email:
                    </span>
                    <a href={`mailto:${user.email}`} className="text-primary hover:underline font-semibold print-url">
                      {user.email}
                    </a>
                  </div>

                  {user.bio && (
                    <div className="sm:col-span-2 border-t pt-3">
                      <span className="text-muted-foreground block font-medium mb-1">Bio:</span>
                      <p className="italic text-foreground">{user.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isMentorRecord(user) && (
              <Card className="border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    Verification History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Full audit trail of educator verification events, newest first
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {verificationHistory.loading ? (
                    <p className="text-xs text-muted-foreground">Loading verification history...</p>
                  ) : verificationHistory.error ? (
                    <p className="text-xs text-destructive">{verificationHistory.error}</p>
                  ) : verificationHistory.events.length > 0 ? (
                    <div className="space-y-3">
                      {verificationHistory.source === "composed" && (
                        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                          Backend history endpoint is not available yet; this timeline is composed from verification record fields.
                        </p>
                      )}
                      <ol className="relative border-l pl-4">
                        {verificationHistory.events.map((event) => (
                          <li key={event.id} className="relative pb-5 last:pb-0">
                            <span className="absolute -left-[21px] top-0 flex h-3 w-3 rounded-full border-2 border-background bg-primary" />
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "capitalize font-semibold",
                                      VERIFICATION_BADGE_STYLES[event.type] || "bg-muted"
                                    )}
                                  >
                                    {event.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Actor: <span className="font-medium text-foreground">{event.actor}</span>
                                  </span>
                                </div>
                                {event.note && (
                                  <p className="text-xs text-muted-foreground">{event.note}</p>
                                )}
                              </div>
                              <time className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatVerificationTimestamp(event.timestamp)}
                              </time>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No verification events recorded yet.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Wallet & Stellar Chain Information */}
            <Card className="border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Stellar Wallet & On-Chain Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block">Stellar Account Public Key:</span>
                    <p className="font-mono text-xs font-semibold break-all select-all mt-0.5">
                      {user.walletAddress || "Not connected"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Network Explorer Link:</span>
                    {explorerUrl ? (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold print-url inline-flex items-center gap-1 mt-0.5"
                      >
                        {explorerUrl}
                        <ExternalLink className="h-3 w-3 no-print" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Activity & Purchase History */}
            <Card className="border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Transaction & Purchase History
                </CardTitle>
                <CardDescription className="text-xs">
                  Summary of transactions recorded for this user
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {user.purchases && user.purchases.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b font-semibold">
                        <tr>
                          <th className="p-2">Item</th>
                          <th className="p-2">Amount</th>
                          <th className="p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.purchases.map((p) => (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="p-2 font-medium">{p.title}</td>
                            <td className="p-2 font-mono">{p.amount} USDC</td>
                            <td className="p-2 text-muted-foreground">{p.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No purchases recorded.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageShell>
  );
}
