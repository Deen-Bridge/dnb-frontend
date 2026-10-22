export type VerificationFlow = "verify-now" | "skip";
export function nextVerificationStep(flow: VerificationFlow): string { return flow === "verify-now" ? "/dashboard/verification" : "/dashboard"; }
