import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * A consistent, accessible empty state for rows in admin tables and queues.
 * `action` can be a button or another small recovery action.
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  colSpan = 1,
  className,
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <div
          role="status"
          className={cn(
            "flex min-h-40 flex-col items-center justify-center gap-2 px-4 py-8 text-center",
            className
          )}
        >
          {Icon && (
            <Icon
              className="mb-1 h-8 w-8 text-muted-foreground/60"
              aria-hidden="true"
            />
          )}
          <p className="font-medium text-foreground">{title}</p>
          {description && (
            <p className="max-w-md text-sm text-muted-foreground">
              {description}
            </p>
          )}
          {action && <div className="pt-2">{action}</div>}
        </div>
      </TableCell>
    </TableRow>
  );
}
