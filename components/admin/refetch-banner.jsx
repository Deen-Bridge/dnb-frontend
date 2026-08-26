import { Loader2 } from "lucide-react";

export function RefetchBanner({ isRefetching }) {
  if (!isRefetching) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
      <Loader2 className="h-4 w-4 animate-spin" />
      Refreshing data…
    </div>
  );
}
