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
import { Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";

export default function RestoreBookDialog({
  open,
  onOpenChange,
  book,
  onRestored,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleRestore = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Mock handler — replace with real action when API is ready
      await new Promise((resolve) => setTimeout(resolve, 600));
      onRestored?.(book._id);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || "Failed to restore book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={cn(
              "flex items-center gap-2",
              poppins_500.className
            )}
          >
            <RotateCcw
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            Restore Book
          </DialogTitle>
          <DialogDescription className={poppins_400.className}>
            This will restore <strong>{book?.title ?? "this book"}</strong> to
            the catalog and reading views, returning it to its prior active
            state.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p
            role="alert"
            className={cn("text-sm text-destructive", poppins_400.className)}
          >
            {error}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            disabled={submitting}
            aria-label={`Confirm restore: ${book?.title ?? "book"}`}
          >
            {submitting ? (
              <>
                <Loader2
                  className="h-4 w-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Restoring…
              </>
            ) : (
              "Restore Book"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
