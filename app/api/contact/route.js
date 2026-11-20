import { NextResponse } from "next/server";
import crypto from "node:crypto";

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 3;
const requests = new Map();
const submissions = new Map();

function jsonError(message, status, requestId) {
  return NextResponse.json({ ok: false, error: message, requestId }, { status });
}

function requestId() {
  return crypto.randomUUID();
}

function clientKey(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

function validEmail(value) {
  return typeof value === "string" && value.length <= MAX_EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(body) {
  if (!body || typeof body !== "object") return "A contact request is required.";
  if (typeof body.name !== "string" || !body.name.trim() || body.name.length > MAX_NAME) return "Enter a valid name.";
  if (!validEmail(body.email)) return "Enter a valid email address.";
  if (typeof body.topic !== "string" || body.topic.length > 100) return "Choose a valid topic.";
  if (typeof body.message !== "string" || !body.message.trim() || body.message.length > MAX_MESSAGE) return "Enter a message under 5,000 characters.";
  if (body.website) return "Unable to process this request.";
  return null;
}

function rateLimited(key, now = Date.now()) {
  const recent = (requests.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requests.set(key, recent);
    return true;
  }
  recent.push(now);
  requests.set(key, recent);
  return false;
}

export async function POST(request) {
  const id = requestId();
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Send a valid JSON request.", 400, id);
  }

  const validationError = validate(body);
  if (validationError) return jsonError(validationError, 400, id);

  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (idempotencyKey && submissions.has(idempotencyKey)) {
    return NextResponse.json({ ...submissions.get(idempotencyKey), duplicate: true }, { status: 200 });
  }

  if (rateLimited(clientKey(request))) {
    return jsonError("Too many requests. Please try again shortly.", 429, id);
  }

  const providerUrl = process.env.SUPPORT_CONTACT_WEBHOOK_URL;
  if (!providerUrl) return jsonError("Support submissions are temporarily unavailable. Please use the email fallback.", 503, id);

  const payload = {
    requestId: id,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    topic: body.topic,
    message: body.message.trim(),
  };

  try {
    const response = await fetch(providerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return jsonError("Support is temporarily unavailable. Please try again or use the email fallback.", 502, id);
  } catch {
    return jsonError("Support is temporarily unavailable. Please try again or use the email fallback.", 502, id);
  }

  const result = { ok: true, requestId: id, status: "received" };
  if (idempotencyKey) submissions.set(idempotencyKey, result);
  return NextResponse.json(result, { status: 202 });
}

export function __resetContactState() {
  requests.clear();
  submissions.clear();
}
