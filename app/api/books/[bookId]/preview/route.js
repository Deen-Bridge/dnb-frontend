import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config/env";

const getBackendBaseUrl = () => {
  return config.apiUrl.replace(/\/$/, "");
};

const MAX_PREVIEW_BYTES = 25 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 15_000;
const BOOK_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const RANGE_RE = /^bytes=\d*-\d*$/;

function errorResponse(status, message) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function safeContentType(value) {
  if (typeof value !== "string") return "application/octet-stream";
  const type = value.split(";", 1)[0].trim().toLowerCase();
  return type === "application/pdf" || type.startsWith("image/")
    ? type
    : "application/octet-stream";
}

export async function GET(request, { params }) {
  const { bookId } = await params || {};

  if (!bookId || !BOOK_ID_RE.test(bookId)) {
    return errorResponse(400, "A valid book ID is required");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const backendUrl = `${getBackendBaseUrl()}/api/books/${bookId}/preview`;
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const range = request.headers.get("range");
    if (range && RANGE_RE.test(range)) headers.set("Range", range);

    const backendResponse = await fetch(backendUrl, {
      headers,
      cache: "no-store",
      signal: controller.signal,
    });

    if (!backendResponse.ok) {
      const status = [401, 403, 404, 416].includes(backendResponse.status)
        ? backendResponse.status
        : 502;
      return errorResponse(status, status === 401 || status === 403
        ? "You are not authorized to preview this book"
        : status === 404
          ? "Book preview not found"
          : "Book preview is unavailable");
    }

    const contentLength = Number(backendResponse.headers.get("Content-Length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_PREVIEW_BYTES) {
      return errorResponse(413, "Book preview exceeds the allowed size");
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", safeContentType(backendResponse.headers.get("Content-Type")));
    responseHeaders.set("Content-Disposition", 'inline; filename="book-preview"');
    for (const name of ["Content-Length", "Content-Range", "Accept-Ranges"]) {
      const value = backendResponse.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("Cache-Control", "private, no-store");
    responseHeaders.set("Content-Security-Policy", "default-src 'none'; sandbox");
    responseHeaders.set("X-Content-Type-Options", "nosniff");

    let body = backendResponse.body;
    if (body) {
      let bytes = 0;
      const limiter = new TransformStream({
        transform(chunk, streamController) {
          bytes += chunk.byteLength;
          if (bytes > MAX_PREVIEW_BYTES) {
            streamController.error(new Error("preview exceeds size limit"));
            return;
          }
          streamController.enqueue(chunk);
        },
      });
      body = body.pipeThrough(limiter);
    }

    return new NextResponse(body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error?.name === "AbortError") return errorResponse(504, "Book preview timed out");
    console.error("Error proxying book preview:", error?.name || "unknown");
    return errorResponse(502, "Unable to stream book preview");
  } finally {
    clearTimeout(timeout);
  }
}
