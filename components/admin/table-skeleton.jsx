import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return [...Array(rows)].map((_, i) => (
    <TableRow key={i}>
      <TableCell colSpan={columns} className="py-3">
        <Skeleton className="h-8 w-full rounded-full" />
      </TableCell>
    </TableRow>
  ));
}
