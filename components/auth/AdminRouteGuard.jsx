"use client";

import { usePathname } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { ROLES } from "@/lib/auth/roles";

const ADMIN_ROUTE = /\/admin(?:\/|$)/;

/** Apply the existing role guard to every localized admin route. */
export default function AdminRouteGuard({ children }) {
  const pathname = usePathname() || "";

  if (!ADMIN_ROUTE.test(pathname)) return children;

  return (
    <RoleGuard roles={[ROLES.ADMIN]} redirectTo="/dashboard/unauthorized">
      {children}
    </RoleGuard>
  );
}
