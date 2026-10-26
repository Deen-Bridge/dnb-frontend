"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { REJECTION_REASON_CATEGORIES } from "@/lib/actions/admin-verifications";

// Lives in its own file because a Next.js page module may only export the
// page itself (and route config); exporting this from page.jsx fails the build.
/** Decision controls, rendered in a side column on desktop and a bottom sheet on mobile. */
export default function DecisionPanel({ application, busy, onApprove, onReject }) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const decided = application.status === "approved" || application.status === "rejected";

  if (decided) {
    return (
      <p className="text-sm" data-testid="decision-final">
        This application was <strong>{application.status}</strong>.
        {application.rejectionReason ? ` Reason: ${application.rejectionReason}` : ""}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" disabled={busy} onClick={onApprove}>
        Approve
      </Button>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Reject with reason</legend>
        {REJECTION_REASON_CATEGORIES.map((c) => (
          <label key={c.id} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="reason"
              value={c.id}
              checked={reason === c.id}
              onChange={() => setReason(c.id)}
            />
            <span>{c.label}</span>
          </label>
        ))}
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes for the applicant (optional)"
        />
      </fieldset>
      <Button
        variant="destructive"
        className="w-full"
        disabled={busy || !reason}
        onClick={() => onReject({ reasonCategory: reason, notes })}
      >
        Reject
      </Button>
    </div>
  );
}
