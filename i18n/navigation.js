import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware drop-in replacements for next/link and next/navigation. Using
// these keeps the active locale on the URL when navigating, which is what lets
// the language switcher preserve the current route across a locale change.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
