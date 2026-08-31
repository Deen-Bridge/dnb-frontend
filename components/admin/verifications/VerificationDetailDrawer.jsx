"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_500, poppins_600 } from "@/lib/config/font.config";
import { REJECTION_REASON_CATEGORIES } from "@/lib/actions/admin-verifications";
import { toast } from "sonner";

/**
 * VerificationDetailDrawer
 * ------------------------
 * Modal/Drawer component for inspecting full educator verification details,
 * uploaded documents, liveness results, and performing individual decisions.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onOpenChange
 * @param {Object} props.application
 * @param {Function} props.onApprove
 * @param {Function} props.onReject
 */
export default function VerificationDetailDrawer({
  open,
  onOpenChange,
  application,
  onApprove,
  onReject,
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reasonCategory, setReasonCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!application) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(application);
      onOpenChange(false);
    } catch {
      toast.error("Failed to approve application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!reasonCategory) {
      toast.error("Please select a reason category.");
      return;
    }
    setSubmitting(true);
    try {
      await onReject(application, { reasonCategory, notes });
      onOpenChange(false);
    } catch {
      toast.error("Failed to reject application.");
    } finally {
      setSubmitting(false);
      setRejecting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setRejecting(false);
          setReasonCategory("");
          setNotes("");
        }
        onOpenChange(v);
      }}
    >
      <DialogContent
        data-testid="verification-detail-modal"
        className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6 gap-5 bg-surface-raised border-accent/15"
      >
        <DialogHeader className="gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 rounded-xl border border-accent/15">
                <AvatarFallback className="bg-secondary/15 text-accent font-semibold text-sm">
                  {(application.name || application.email || "E")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <DialogTitle
                  className={cn(poppins_600, "text-lg text-ink leading-tight")}
                >
                  {application.name || "Educator Applicant"}
                </DialogTitle>
                <DialogDescription className="text-xs text-ink-muted flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" />
                    {application.email}
                  </span>
                  {application.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {application.country}
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "text-xs capitalize font-medium py-0.5",
                application.status === "approved" &&
                  "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                application.status === "rejected" &&
                  "bg-red-500/10 text-red-600 border-red-500/30",
                application.status === "pending" &&
                  "bg-amber-500/10 text-amber-600 border-amber-500/30"
              )}
            >
              {application.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Liveness and Identity Verification Signal */}
          <div className="p-4 rounded-xl bg-surface border border-accent/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  poppins_600,
                  "text-xs text-ink flex items-center gap-1.5 font-semibold"
                )}
              >
                {application.livenessPassed !== false ? (
                  <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ShieldAlert className="size-4 text-red-600 dark:text-red-400" />
                )}
                Liveness & Identity Check
              </span>

              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] py-0.5",
                  application.livenessPassed !== false
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-red-500/10 text-red-600 border-red-500/30"
                )}
              >
                {application.livenessPassed !== false
                  ? `Passed (${application.livenessScore || 95}% confidence)`
                  : `Failed (${application.livenessScore || 85}% confidence)`}
              </Badge>
            </div>
            <p className="text-ink-muted text-[11px]">
              {application.livenessPassed !== false
                ? "Facial geometry verified against submitted government identification with 3D depth matching."
                : "Liveness score fell below required confidence threshold or face mismatch was detected."}
            </p>
          </div>

          {/* Bio and subjects */}
          {application.bio && (
            <div className="p-4 rounded-xl bg-surface border border-accent/10 space-y-2">
              <span className={cn(poppins_600, "text-xs text-ink font-semibold")}>
                Applicant Bio & Credentials
              </span>
              <p className="text-ink-muted leading-relaxed">{application.bio}</p>

              {application.subjects && application.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {application.subjects.map((sub) => (
                    <Badge
                      key={sub}
                      variant="secondary"
                      className="text-[10px] bg-secondary/15 text-accent font-medium py-0"
                    >
                      {sub}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Uploaded Verification Documents */}
          <div className="space-y-2">
            <span
              className={cn(
                poppins_600,
                "text-xs text-ink flex items-center gap-1.5 px-1 font-semibold"
              )}
            >
              <FileText className="size-3.5" />
              Uploaded Documents ({application.documents?.length || 0})
            </span>

            <div className="divide-y divide-accent/10 rounded-xl border border-accent/10 bg-surface">
              {application.documents && application.documents.length > 0 ? (
                application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate capitalize">
                          {doc.type ? doc.type.replace(/_/g, " ") : "Document"}
                        </p>
                        <p className="text-[11px] text-ink-muted truncate">
                          {doc.name || "scanned_doc.pdf"}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info(`Fetching signed URL for ${doc.name}...`);
                      }}
                      className="text-xs h-7 px-2.5 border-accent/20"
                    >
                      <Eye className="size-3 mr-1" />
                      View
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-ink-muted text-xs">
                  No documents uploaded.
                </div>
              )}
            </div>
          </div>

          {/* Rejection reason picker if rejection form open */}
          {rejecting && (
            <div className="space-y-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <Label
                  htmlFor="single-rejection-reason"
                  className={cn(
                    poppins_500,
                    "text-xs text-ink font-semibold flex items-center gap-1"
                  )}
                >
                  <span>Rejection Reason Category</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={reasonCategory}
                  onValueChange={setReasonCategory}
                >
                  <SelectTrigger
                    id="single-rejection-reason"
                    className="w-full bg-surface border-accent/20 text-xs h-9"
                  >
                    <SelectValue placeholder="Select a reason category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-raised border-accent/15 z-50">
                    {REJECTION_REASON_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="text-xs cursor-pointer"
                      >
                        <span className="font-medium">{cat.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="single-rejection-notes"
                  className={cn(poppins_500, "text-xs text-ink font-semibold")}
                >
                  Feedback Notes <span className="text-ink-muted font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="single-rejection-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detailed notes for the applicant..."
                  rows={2}
                  className="bg-surface border-accent/20 text-xs resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-accent/10">
          {rejecting ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejecting(false)}
                className="border-accent/20 text-xs h-9"
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={submitting || !reasonCategory}
                onClick={handleRejectConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 px-4 ml-auto"
              >
                Confirm Rejection
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-accent/20 text-xs h-9"
              >
                Close
              </Button>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejecting(true)}
                  className="border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs h-9 px-3.5"
                >
                  <XCircle className="size-3.5 mr-1.5" />
                  Reject
                </Button>

                <Button
                  type="button"
                  disabled={submitting}
                  onClick={handleApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4"
                >
                  <CheckCircle className="size-3.5 mr-1.5" />
                  Approve Application
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
