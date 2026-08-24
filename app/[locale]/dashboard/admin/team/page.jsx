"use client";
import { useState } from "react";
import {
  Check,
  Copy,
  Link2,
  MoreHorizontal,
  ShieldCheck,
  UserMinus,
  UserX,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminTierGuard from "@/components/auth/AdminTierGuard";
import StepUpConfirmDialog from "@/components/auth/StepUpConfirmDialog";
import useAuth from "@/hooks/useAuth";
import useAdminTeam from "@/hooks/useAdminTeam";
import { TIERS, getAdminTier } from "@/lib/auth/admin-tiers";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const tierBadge = {
  [TIERS.SUPER_ADMIN]: "bg-secondary/10 text-secondary border-secondary/20",
  [TIERS.STAFF]: "bg-accent/10 text-accent border-accent/20",
};

const tierLabel = {
  [TIERS.SUPER_ADMIN]: "Super admin",
  [TIERS.STAFF]: "Staff",
};

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function lastActiveLabel(iso) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown";
  return formatDistanceToNow(date, { addSuffix: true });
}

function InviteDialog({ open, onClose, onCreateInvite }) {
  const [tier, setTier] = useState(TIERS.STAFF);
  const [email, setEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [invite, setInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleClose = (next) => {
    if (!next) {
      setInvite(null);
      setEmail("");
      setTier(TIERS.STAFF);
      setCopied(false);
      setIsCreating(false);
    }
    onClose(next);
  };

  const handleGenerate = async () => {
    setIsCreating(true);
    try {
      // TODO(backend): the returned invite comes from the stubbed service —
      // once the backend lands this link will be minted server-side.
      const result = await onCreateInvite({ email: email.trim() || undefined, tier });
      setInvite(result);
    } catch (err) {
      console.error("Failed to create invite:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invite?.url || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Clipboard unavailable");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border border-accent/10 bg-surface-raised sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
          >
            <Link2 className="h-5 w-5 text-secondary" />
            Invite an admin
          </DialogTitle>
          <DialogDescription className={cn(poppins_400.className, "text-ink-muted")}>
            Generate a single-use invite link. Whoever accepts it joins the admin
            team with the tier you pick, recorded as invited by you.
          </DialogDescription>
        </DialogHeader>

        {invite ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className={cn(poppins_500.className, "text-sm text-ink")}>Invite link</p>
              <div className="flex items-center gap-2">
                <Input readOnly value={invite.url} aria-label="Invite link" />
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  onClick={handleCopy}
                  aria-label="Copy invite link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-secondary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
              Expires {lastActiveLabel(invite.expiresAt)} · single use
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className={cn(poppins_500.className, "text-sm text-ink")}>Tier</p>
              <div className="flex gap-2">
                {[TIERS.STAFF, TIERS.SUPER_ADMIN].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={tier === option ? "default" : "outline"}
                    className={cn(
                      "rounded-full",
                      tier === option && "bg-accent text-white hover:bg-accent/90"
                    )}
                    onClick={() => setTier(option)}
                  >
                    {tierLabel[option]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="invite-email"
                className={cn(poppins_500.className, "text-sm text-ink")}
              >
                Email (optional)
              </label>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@deenbridge.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="rounded-full" onClick={() => handleClose(false)}>
            Close
          </Button>
          {!invite && (
            <Button
              className="rounded-full bg-accent text-white hover:bg-accent/90"
              disabled={isCreating}
              onClick={handleGenerate}
            >
              {isCreating ? "Generating…" : "Generate invite"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({ member, currentUserId }) {
  const [pendingAction, setPendingAction] = useState(null);
  const tier = getAdminTier(member);
  const isSelf = member.id === currentUserId;
  const isSuperAdminMember = tier === TIERS.SUPER_ADMIN;

  const confirmPhrase = member.email;
  const description =
    pendingAction === "demote"
      ? `${member.name} will lose super-admin permissions and become staff.`
      : `${member.name}'s admin access will be removed entirely.`;

  const handleConfirm = async () => {
    if (pendingAction === "demote") {
      await member.actions.demote(member.id, { confirmation: confirmPhrase });
    } else if (pendingAction === "revoke") {
      await member.actions.revoke(member.id, { confirmation: confirmPhrase });
    }
    setPendingAction(null);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-9 w-9 border border-accent/10">
              <AvatarImage src={member.avatar || "/images/dnb-nobg.png"} alt={member.name} />
              <AvatarFallback className="bg-surface-raised text-xs">
                {initials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className={cn(poppins_500.className, "text-sm text-ink")}>
                {member.name}
                {isSelf && (
                  <span className={cn(poppins_400.className, "ml-1.5 text-xs text-ink-muted")}>
                    (you)
                  </span>
                )}
              </p>
              <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>{member.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn("rounded-full capitalize", tierBadge[tier])}>
            {tierLabel[tier] || tier}
          </Badge>
        </TableCell>
        <TableCell className={cn(poppins_400.className, "text-sm text-ink-muted")}>
          {lastActiveLabel(member.lastActiveAt)}
        </TableCell>
        <TableCell className={cn(poppins_400.className, "text-sm text-ink-muted")}>
          {member.addedBy?.name || "—"}
        </TableCell>
        <TableCell className="text-right">
          {isSelf ? null : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label={`Actions for ${member.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-accent/10">
                {isSuperAdminMember && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setPendingAction("demote")}
                  >
                    <UserMinus className="h-4 w-4" />
                    Demote to staff
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setPendingAction("revoke")}
                >
                  <UserX className="h-4 w-4" />
                  Revoke access
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>

      <StepUpConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(next) => !next && setPendingAction(null)}
        title={pendingAction === "demote" ? "Demote admin" : "Revoke admin access"}
        description={description}
        confirmPhrase={confirmPhrase}
        confirmLabel={pendingAction === "demote" ? "Demote" : "Revoke"}
        onConfirm={handleConfirm}
      />
    </>
  );
}

function LoadingRows() {
  return [...Array(3)].map((_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={5} className="py-3">
        <Skeleton className="h-8 w-full rounded-full" />
      </TableCell>
    </TableRow>
  ));
}

function AdminTeamContent() {
  const { user } = useAuth();
  const { admins, isLoading, error, refresh, inviteAdmin, demoteMember, revokeMember } =
    useAdminTeam();
  const [inviteOpen, setInviteOpen] = useState(false);

  const membersWithActions = admins.map((member) => ({
    ...member,
    actions: { demote: demoteMember, revoke: revokeMember },
  }));

  return (
    <PageShell>
      <PageHeader
        icon={Users}
        title="Admin team"
        subtitle="Manage admin access and role tiers across DeenBridge"
        actions={
          <Button
            className="rounded-full bg-accent text-white hover:bg-accent/90"
            onClick={() => setInviteOpen(true)}
          >
            <Link2 className="mr-1 h-4 w-4" />
            Invite admin
          </Button>
        }
      />

      {error ? (
        <EmptyState
          icon={ShieldCheck}
          title="Failed to load"
          description={error}
          action={
            <Button variant="outline" className="rounded-full" onClick={() => refresh()}>
              Try again
            </Button>
          }
        />
      ) : isLoading ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead>Added by</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{LoadingRows()}</TableBody>
        </Table>
      ) : membersWithActions.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No admins yet"
          description="Invite your first teammate to start building the admin team."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead>Added by</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersWithActions.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  currentUserId={user?._id || user?.id}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteDialog
        open={inviteOpen}
        onClose={setInviteOpen}
        onCreateInvite={inviteAdmin}
      />
    </PageShell>
  );
}

export default function AdminTeamPage() {
  return (
    <AdminTierGuard>
      <AdminTeamContent />
    </AdminTierGuard>
  );
}
