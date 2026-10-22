export type VerificationStatus = "pending" | "verified" | "rejected" | "not_started";
export function canResumeVerification(status: VerificationStatus): boolean { return status === "pending" || status === "rejected" || status === "not_started"; }
