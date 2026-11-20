import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config/env";
import {
  ticketResponse,
  validateTicketInput,
} from "@/lib/support/ticketContract";

export const runtime = "nodejs";

function backendUrl() {
  return `${config.apiUrl.replace(/\/$/, "")}/api/support/tickets`;
}

async function authHeaders() {
  const token = (await cookies()).get("authToken")?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };
  return { body, status: response.status };
}

function sendResponse({ body, status }) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  const headers = await authHeaders();
  if (!headers) return NextResponse.json({ message: "Authentication required." }, { status: 401 });

  try {
    return sendResponse(await readResponse(await fetch(backendUrl(), { headers, cache: "no-store" })));
  } catch {
    return NextResponse.json({ message: "Support service is unavailable." }, { status: 503 });
  }
}

export async function POST(request) {
  const headers = await authHeaders();
  if (!headers) return NextResponse.json({ message: "Authentication required." }, { status: 401 });

  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    return NextResponse.json({ message: "A valid Idempotency-Key is required." }, { status: 400 });
  }

  let input;
  try {
    const form = await request.formData();
    const file = form.get("attachment");
    input = validateTicketInput({
      subject: form.get("subject"),
      description: form.get("description"),
      file: file instanceof File && file.size > 0 ? file : null,
    });
    if (!input.ok) return NextResponse.json({ message: input.error }, { status: 400 });

    const outbound = new FormData();
    outbound.set("subject", input.subject);
    outbound.set("description", input.description);
    if (file instanceof File && file.size > 0) outbound.set("attachment", file, file.name);

    const response = await fetch(backendUrl(), {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": idempotencyKey },
      body: outbound,
      cache: "no-store",
    });
    const result = await readResponse(response);
    if (response.ok && !ticketResponse(result.body)) {
      return NextResponse.json({ message: "Support service returned an invalid ticket." }, { status: 502 });
    }
    return sendResponse(result);
  } catch {
    return NextResponse.json({ message: "Support service is unavailable." }, { status: 503 });
  }
}
