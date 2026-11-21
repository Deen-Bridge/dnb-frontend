export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/csp-report") && !contentType.includes("application/json")) {
    return new Response(null, { status: 415 });
  }

  // Accept reports without persisting browser-controlled URLs or request data.
  // A deployment can forward sanitized reports to its observability pipeline.
  try {
    await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  return new Response(null, { status: 204 });
}
