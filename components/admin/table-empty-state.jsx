import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function TableEmptyState({ icon, title, description, action }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4, className }) {
  const rowIndices = Array.from({ length: rows });
  const columnIndices = Array.from({ length: columns });

  return (
    <div
      role="status"
      aria-label="Loading table data"
      className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-center gap-4">
        {columnIndices.map((column) => (
          <Skeleton key={column} className="h-4 flex-1" />
        ))}
      </div>
      {rowIndices.map((row) => (
        <div key={row} className="flex items-center gap-4">
          {columnIndices.map((column) => (
            <Skeleton key={column} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
