import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableBody, TableCell } from "@/components/ui/table";

export function TableSkeleton({ rows = 5, columns = 5 }) {
  const columnIndices = Array.from({ length: columns });

  return (
    <TableBody data-testid="table-skeleton">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {columnIndices.map((__, columnIndex) => (
            <TableCell key={columnIndex} className="py-3">
              <Skeleton className="h-4 w-full rounded-md" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
