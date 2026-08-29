"use server";

import { cookies } from "next/headers";
import {
  cancelScheduledReel,
  listUpcomingScheduledReels,
} from "@/lib/services/scheduled-reels";

const ADMIN_ROLES = new Set([
  "admin",
  "super-admin",
  "super_admin",
  "superadmin",
]);

function getApiBaseUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");

  if (!cookieHeader) {
    throw new Error("Authentication is required to manage scheduled reels.");
  }

  if (!apiBaseUrl) {
    throw new Error("Administrator session verification is unavailable.");
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Administrator session verification is unavailable.");
  }

  if (!response.ok) {
    throw new Error("Authentication is required to manage scheduled reels.");
  }

  const payload = await response.json();
  const user = payload?.user ?? payload?.data?.user ?? payload?.data ?? payload;
  const role =
    typeof user?.role === "string" ? user.role : user?.role?.name;
  const normalizedRole = role?.toLowerCase();

  if (!normalizedRole || !ADMIN_ROLES.has(normalizedRole)) {
    throw new Error("Administrator access is required to manage scheduled reels.");
  }

  const administratorId = user?.id ?? user?._id ?? user?.email;
  if (!administratorId) {
    throw new Error("The authenticated administrator could not be identified.");
  }

  return {
    administratorId: String(administratorId),
  };
}

export async function listUpcomingScheduledReelsAction() {
  await requireAdminSession();
  return listUpcomingScheduledReels();
}

export async function cancelScheduledReelAction(reelId, reason) {
  const { administratorId } = await requireAdminSession();

  if (typeof reelId !== "string" || !reelId.trim()) {
    throw new Error("A scheduled reel identifier is required.");
  }

  return cancelScheduledReel(reelId, {
    cancelledBy: administratorId,
    reason: typeof reason === "string" ? reason : "",
  });
}
