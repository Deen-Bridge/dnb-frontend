import { PageShell } from "@/components/ui/page-shell";
import Unauthorized from "@/components/molecules/errors/Unauthorized";

export default function UnauthorizedPage() {
  return (
    <PageShell>
      <Unauthorized />
    </PageShell>
  );
}
