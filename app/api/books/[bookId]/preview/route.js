import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const getBackendBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return base.replace(/\/$/, "");
};

export async function GET(_request, { params }) {
  const { bookId } = await params;

  if (!bookId) {
    return NextResponse.json(
      { success: false, message: "bookId is required" },
      { status: 400 }
    );
  }

  try {
    const backendUrl = `${getBackendBaseUrl()}/api/books/${bookId}/preview`;
    const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const backendResponse = await fetch(backendUrl, {
      headers,
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      const errorBody = backendResponse.headers
        .get("content-type")
        ?.includes("application/json")
        ? await backendResponse.json()
        : await backendResponse.text();

      return NextResponse.json(
        typeof errorBody === "string" ? { message: errorBody } : errorBody,
        { status: backendResponse.status }
      );
    }

    const responseHeaders = new Headers();
    const contentType = backendResponse.headers.get("Content-Type");
    if (contentType) {
      responseHeaders.set("Content-Type", contentType);
    }
    const disposition = backendResponse.headers.get("Content-Disposition");
    if (disposition) {
      responseHeaders.set("Content-Disposition", disposition);
    }
    responseHeaders.set("Cache-Control", "private, max-age=0, no-cache");

    return new NextResponse(backendResponse.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error proxying book preview:", error);
    return NextResponse.json(
      { success: false, message: "Unable to stream book preview" },
      { status: 500 }
    );
  }
}
