"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Monitor,
  Loader2,
  Eye,
  EyeOff,
  LogOut,
  Check,
  Fingerprint,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import { changePassword } from "@/lib/actions/auth/changePassword";
import {
  getSessions,
  revokeSession,
  revokeOtherSessions,
} from "@/lib/actions/auth/sessions";

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const CardHead = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-3 border-b border-accent/10 p-5 sm:p-6">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
      <Icon className="h-5 w-5 text-accent" />
    </div>
    <div>
      <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
      <p className={cn(poppins_400, "mt-0.5 text-sm text-ink-muted")}>{desc}</p>
    </div>
  </div>
);

const PasswordField = ({ id, label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={cn(poppins_500, "text-sm text-ink")}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            poppins_400,
            "w-full rounded-xl border border-accent/15 bg-surface py-2.5 pl-4 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

const deviceIcon = (ua = "") =>
  /mobile|android|iphone|ipad/i.test(ua) ? Smartphone : Monitor;

export default function SecurityPage() {
  // ── password ──
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  // ── sessions ──
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    const res = await getSessions();
    setSessions(res.success ? res.sessions : []);
    setSessionsLoading(false);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pw.current || !pw.next) {
      toast.error("Enter your current and new password");
      return;
    }
    if (pw.next !== pw.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (pw.next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    const res = await changePassword({
      currentPassword: pw.current,
      newPassword: pw.next,
    });
    if (res.success) {
      toast.success(res.message);
      setPw({ current: "", next: "", confirm: "" });
      loadSessions(); // other sessions were signed out
    } else {
      toast.error(res.message);
    }
    setPwLoading(false);
  };

  const handleRevoke = async (id) => {
    setRevoking(id);
    const res = await revokeSession(id);
    if (res.success) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Device signed out");
    } else {
      toast.error("Couldn't sign out that device");
    }
    setRevoking(null);
  };

  const handleRevokeOthers = async () => {
    const res = await revokeOtherSessions();
    if (res.success) {
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success("Signed out of all other devices");
    } else {
      toast.error("Couldn't sign out other devices");
    }
  };

  const otherCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="min-h-full bg-surface p-3 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
            <ShieldCheck className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1
              className={cn(
                poppins_600,
                "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
              )}
            >
              Security
            </h1>
            <p className={cn(poppins_400, "text-sm text-ink-muted")}>
              Keep your account safe — password, 2FA, and active devices
            </p>
          </div>
        </div>

        {/* Change password */}
        <Panel>
          <CardHead
            icon={KeyRound}
            title="Change password"
            desc="Use a strong, unique password. Changing it signs out your other devices."
          />
          <form onSubmit={handleChangePassword} className="space-y-4 p-5 sm:p-6">
            <PasswordField
              id="current"
              label="Current password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              placeholder="Enter current password"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PasswordField
                id="next"
                label="New password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                placeholder="At least 8 characters"
              />
              <PasswordField
                id="confirm"
                label="Confirm new password"
                value={pw.confirm}
                onChange={(e) =>
                  setPw((p) => ({ ...p, confirm: e.target.value }))
                }
                placeholder="Re-enter new password"
              />
            </div>
            <div className="flex justify-end">
              <Button
                round
                type="submit"
                disabled={pwLoading}
                className={cn(poppins_500, "bg-accent px-6 text-sm text-white hover:bg-highlight")}
              >
                {pwLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </div>
          </form>
        </Panel>

        {/* Two-factor */}
        <Panel>
          <CardHead
            icon={Fingerprint}
            title="Two-factor authentication"
            desc="Add a second step at sign-in for stronger protection."
          />
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  poppins_500,
                  "inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700"
                )}
              >
                Not enabled
              </span>
              <span className={cn(poppins_400, "text-sm text-ink-muted")}>
                Coming soon — authenticator-app (TOTP) support.
              </span>
            </div>
            <Button round disabled className="px-5 text-sm opacity-60">
              Enable 2FA
            </Button>
          </div>
        </Panel>

        {/* Active sessions */}
        <Panel className="overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-accent/10 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
                <Monitor className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className={cn(poppins_600, "text-lg text-ink")}>
                  Active devices &amp; sessions
                </h2>
                <p className={cn(poppins_400, "mt-0.5 text-sm text-ink-muted")}>
                  Devices currently signed in to your account
                </p>
              </div>
            </div>
            {otherCount > 0 && (
              <button
                onClick={handleRevokeOthers}
                className={cn(
                  poppins_500,
                  "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-100"
                )}
              >
                <LogOut className="h-4 w-4" />
                Sign out others
              </button>
            )}
          </div>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : sessions.length === 0 ? (
            <p className={cn(poppins_400, "px-6 py-10 text-center text-sm text-ink-muted")}>
              No active sessions found.
            </p>
          ) : (
            <ul className="divide-y divide-accent/10">
              {sessions.map((s) => {
                const Icon = deviceIcon(s.device?.userAgent);
                return (
                  <li key={s.id} className="flex items-center gap-3 p-4 sm:px-6">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface">
                      <Icon className="h-5 w-5 text-ink-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={cn(poppins_500, "text-sm text-ink")}>
                          {s.device?.label || "Unknown device"}
                        </p>
                        {s.isCurrent && (
                          <span
                            className={cn(
                              poppins_500,
                              "inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] text-secondary"
                            )}
                          >
                            <Check className="h-3 w-3" />
                            This device
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          poppins_400,
                          "mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted"
                        )}
                      >
                        {s.device?.ip && <span>{s.device.ip}</span>}
                        {s.lastUsedAt && (
                          <>
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(s.lastUsedAt), {
                              addSuffix: true,
                            })}
                          </>
                        )}
                      </p>
                    </div>
                    {!s.isCurrent && (
                      <button
                        onClick={() => handleRevoke(s.id)}
                        disabled={revoking === s.id}
                        className={cn(
                          poppins_500,
                          "shrink-0 rounded-lg border border-accent/15 px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        )}
                      >
                        {revoking === s.id ? "…" : "Sign out"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
