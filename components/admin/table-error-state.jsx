import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle } from "lucide-react";

export function TableErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Failed to load"
      description={message}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      }
    />
  );
}
