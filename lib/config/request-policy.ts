export type RequestOperation =
  | "auth"
  | "search"
  | "upload"
  | "payment"
  | "call"
  | "background"
  | "default";

export type OperationPolicy = {
  timeoutMs: number;
  maxAttempts: number;
  retryStatuses: readonly number[];
  retryMethods: readonly string[];
};

export const OPERATION_POLICIES: Record<RequestOperation, OperationPolicy> = {
  auth: {
    timeoutMs: 15_000,
    maxAttempts: 1,
    retryStatuses: [],
    retryMethods: [],
  },
  search: {
    timeoutMs: 10_000,
    maxAttempts: 3,
    retryStatuses: [408, 429, 500, 502, 503, 504],
    retryMethods: ["get"],
  },
  upload: {
    timeoutMs: 60_000,
    maxAttempts: 1,
    retryStatuses: [],
    retryMethods: [],
  },
  payment: {
    timeoutMs: 30_000,
    maxAttempts: 1,
    retryStatuses: [],
    retryMethods: [],
  },
  call: {
    timeoutMs: 20_000,
    maxAttempts: 2,
    retryStatuses: [408, 429, 500, 502, 503, 504],
    retryMethods: ["get"],
  },
  background: {
    timeoutMs: 15_000,
    maxAttempts: 2,
    retryStatuses: [408, 429, 500, 502, 503, 504],
    retryMethods: ["get", "head", "options"],
  },
  default: {
    timeoutMs: 15_000,
    maxAttempts: 2,
    retryStatuses: [408, 429, 500, 502, 503, 504],
    retryMethods: ["get", "head", "options"],
  },
};

const operationMatchers: Array<[RequestOperation, RegExp]> = [
  ["auth", /\/api\/auth\//i],
  ["search", /\/api\/search|(?:^|[/?&])search(?=$|[/?&=])/i],
  ["upload", /(?:upload|documents|media)/i],
  ["payment", /(?:payment|purchase|checkout|refund)/i],
  ["call", /(?:jitsi|call|meeting)/i],
  ["background", /(?:notification|profile|user|settings)/i],
];

export const classifyOperation = (url = ""): RequestOperation =>
  operationMatchers.find(([, matcher]) => matcher.test(url))?.[0] ?? "default";

export const getOperationPolicy = (url = "", operation?: RequestOperation) =>
  OPERATION_POLICIES[operation ?? classifyOperation(url)];

export const getRetryDelayMs = (attempt: number, retryAfter?: string) => {
  const retryAfterSeconds = Number(retryAfter);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1000, 8_000);
  }

  const exponential = Math.min(1_000, 250 * 2 ** Math.max(0, attempt - 1));
  return Math.floor(exponential * (0.75 + Math.random() * 0.5));
};

export const waitForRetry = (delayMs: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The request was aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("The request was aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
