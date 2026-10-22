let activeIntent: string | null = null;
export function beginPayment(id: string): boolean { if (activeIntent) return false; activeIntent = id; return true; }
export function finishPayment(id: string): void { if (activeIntent === id) activeIntent = null; }
export function isPaymentActive(): boolean { return activeIntent !== null; }
