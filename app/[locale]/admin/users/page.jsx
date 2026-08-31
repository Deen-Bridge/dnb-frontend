"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Award, Bell, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CREDENTIAL_EXPIRY_STATUS,
  fetchExpiringMentorCredentials,
  matchesCredentialExpiryFilter,
} from "@/lib/actions/admin-credential-expiry";
import { sendReverificationReminder } from "@/lib/services/reverification-reminders";

const FILTERS = [
  { value: "all", label: "All credentials" },
  { value: "30", label: "Expiring within 30 days" },
  { value: "60", label: "Expiring within 60 days" },
  { value: "90", label: "Expiring within 90 days" },
  { value: "expired", label: "Already expired" },
];

function formatExpiryDate(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function statusCopy(credential) {
  if (credential.expiryStatus === CREDENTIAL_EXPIRY_STATUS.EXPIRED) {
    const elapsed = Math.abs(credential.daysRemaining);
    return elapsed === 1 ? "Expired 1 day ago" : `Expired ${elapsed} days ago`;
  }
  if (credential.expiryStatus === CREDENTIAL_EXPIRY_STATUS.MISSING) {
    return "Expiry date missing";
  }
  if (credential.daysRemaining === 0) return "Expires today";
  if (credential.daysRemaining === 1) return "Expires in 1 day";
  return `Expires in ${credential.daysRemaining} days`;
}

function statusVariant(status) {
  if (status === CREDENTIAL_EXPIRY_STATUS.VALID) return "secondary";
  if (status === CREDENTIAL_EXPIRY_STATUS.MISSING) return "outline";
  return "destructive";
}

export default function MentorCredentialExpiryPage() {
  const [credentials, setCredentials] = useState([]);
  const [filter, setFilter] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("api");
  const [sendingId, setSendingId] = useState(null);
  const [remindedIds, setRemindedIds] = useState(() => new Set());

  const loadCredentials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExpiringMentorCredentials();
      setCredentials(result.credentials);
      setSource(result.source);
    } catch (loadError) {
      setError(loadError.message ?? "Failed to load mentor credentials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const filteredCredentials = useMemo(
    () =>
      credentials.filter((credential) =>
        matchesCredentialExpiryFilter(credential, filter)
      ),
    [credentials, filter]
  );

  const expiringCount = useMemo(
    () =>
      credentials.filter(
        (credential) =>
          credential.daysRemaining !== null &&
          credential.daysRemaining >= 0 &&
          credential.daysRemaining <= 90
      ).length,
    [credentials]
  );

  const expiredCount = useMemo(
    () =>
      credentials.filter(
        (credential) =>
          credential.expiryStatus === CREDENTIAL_EXPIRY_STATUS.EXPIRED
      ).length,
    [credentials]
  );

  const handleReminder = useCallback(async (credential) => {
    setSendingId(credential.credentialId);
    try {
      await sendReverificationReminder({
        mentorId: credential.mentorId,
        credentialId: credential.credentialId,
        credentialType: credential.credentialType,
        expiresAt: credential.expiresAt,
      });
      setRemindedIds((current) => {
        const next = new Set(current);
        next.add(credential.credentialId);
        return next;
      });
      toast.success(`Re-verification reminder queued for ${credential.mentorName}`);
    } catch (sendError) {
      toast.error(sendError.message ?? "Failed to send reminder");
    } finally {
      setSendingId(null);
    }
  }, []);

  return (
    <PageShell>
      <PageHeader
        icon={Award}
        title="Mentor credential expiry"
        subtitle="Review expiring credentials and send re-verification reminders"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={loadCredentials}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expiring within 90 days</CardDescription>
            <CardTitle className="text-3xl">{expiringCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Already expired</CardDescription>
            <CardTitle className="text-3xl">{expiredCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Verified mentor credentials</CardTitle>
            <CardDescription className="mt-1">
              Expiry status is computed from each credential&apos;s ISO-8601 expiry date.
            </CardDescription>
          </div>
          <div className="w-full md:w-64">
            <label
              htmlFor="credential-expiry-filter"
              className="mb-2 block text-sm font-medium"
            >
              Expiry window
            </label>
            <select
              id="credential-expiry-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {source === "fallback" && !loading && !error && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Showing representative credential data while the admin credential endpoint is unavailable.
            </div>
          )}

          {loading && (
            <div role="status" className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading mentor credentials…
            </div>
          )}

          {!loading && error && (
            <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" onClick={loadCredentials}>
                Try again
              </Button>
            </div>
          )}

          {!loading && !error && filteredCredentials.length === 0 && (
            <div className="flex min-h-48 items-center justify-center text-center text-sm text-muted-foreground">
              No verified mentor credentials match this expiry window.
            </div>
          )}

          {!loading && !error && filteredCredentials.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th scope="col" className="px-3 py-3 font-medium">Mentor</th>
                    <th scope="col" className="px-3 py-3 font-medium">Credential type</th>
                    <th scope="col" className="px-3 py-3 font-medium">Expiry date</th>
                    <th scope="col" className="px-3 py-3 font-medium">Status</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCredentials.map((credential) => {
                    const sending = sendingId === credential.credentialId;
                    const reminded = remindedIds.has(credential.credentialId);
                    return (
                      <tr key={credential.credentialId} className="border-b last:border-0">
                        <td className="px-3 py-4">
                          <p className="font-medium">{credential.mentorName}</p>
                          <p className="text-xs text-muted-foreground">{credential.mentorEmail}</p>
                        </td>
                        <td className="px-3 py-4">{credential.credentialType}</td>
                        <td className="px-3 py-4">{formatExpiryDate(credential.expiresAt)}</td>
                        <td className="px-3 py-4">
                          <Badge variant={statusVariant(credential.expiryStatus)}>
                            {statusCopy(credential)}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant={reminded ? "outline" : "default"}
                            disabled={sending || reminded}
                            onClick={() => handleReminder(credential)}
                            aria-label={`Send re-verification reminder to ${credential.mentorName} for ${credential.credentialType}`}
                          >
                            {sending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Bell className="mr-2 h-4 w-4" />
                            )}
                            {reminded ? "Reminder queued" : "Send reminder"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
