"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount } from "@/lib/actions/users/deleteAccount";
import { clearClientAccountData } from "@/lib/privacy/accountCleanup";
import { unsubscribeFromPush } from "@/lib/push/pushManager";

const STATUS_COPY = {
  idle: "Your account and its client-side data will be removed after verification.",
  requested: "Deletion request received. Verifying your identity…",
  processing: "Deleting your account and cleaning this device…",
  completed: "Your account and local account data have been removed.",
  failed: "We could not complete the deletion. Nothing was removed from this device.",
};

export default function AccountDeletionPanel({ user, onComplete }) {
  const [status, setStatus] = useState("idle");
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!password.trim() || !acknowledged || status !== "idle") return;
    setError("");
    setStatus("requested");

    try {
      await deleteAccount({ userId: user?._id || user?.id, password });
      setStatus("processing");
      await clearClientAccountData({ unsubscribePush: unsubscribeFromPush });
      setPassword("");
      setStatus("completed");
      onComplete?.();
    } catch (requestError) {
      setStatus("failed");
      setError(requestError?.response?.data?.message || requestError?.message || "Please try again.");
    }
  };

  if (status === "completed") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
        <p className="text-sm text-ink">{STATUS_COPY.completed}</p>
      </div>
    );
  }

  const busy = status === "requested" || status === "processing";
  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-4" noValidate>
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-red-700">Delete account</h3>
          <p className="mt-1 text-sm text-red-700">{STATUS_COPY[status]}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="delete-account-password">Confirm with your password</Label>
        <Input
          id="delete-account-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          disabled={busy}
          aria-describedby={error ? "delete-account-error" : undefined}
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-red-800">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          disabled={busy}
          className="mt-1"
        />
        <span>I understand that deletion removes my account and browser-held drafts, cached data, sessions, and push subscription.</span>
      </label>
      {error && (
        <p id="delete-account-error" role="alert" className="flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" aria-hidden="true" /> {error}
        </p>
      )}
      <Button type="submit" variant="destructive" disabled={busy || !password.trim() || !acknowledged}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />}
        {status === "processing" ? "Deleting…" : status === "requested" ? "Verifying…" : "Delete my account"}
      </Button>
      {status === "failed" && <p className="text-xs text-red-700">{STATUS_COPY.failed}</p>}
    </form>
  );
}
