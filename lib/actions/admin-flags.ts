const MOCK_DELAY_MS = 400;

export interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  critical: boolean;
  updatedAt: string;
}

let mockFlags: FeatureFlag[] | null = null;

function withMockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function seedFlags(): FeatureFlag[] {
  const now = Date.now();
  return [
    {
      key: "new-checkout",
      description: "Redesigned donation checkout flow with saved payment methods.",
      enabled: true,
      rolloutPercentage: 35,
      critical: false,
      updatedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      key: "live-classes",
      description: "Enable live Jitsi-backed classes in the learning dashboard.",
      enabled: true,
      rolloutPercentage: 100,
      critical: false,
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      key: "stellar-payouts",
      description: "Route educator payouts through the Stellar network. Disabling halts all on-chain settlement.",
      enabled: true,
      rolloutPercentage: 100,
      critical: true,
      updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      key: "ai-tutor-beta",
      description: "Experimental AI study assistant surfaced in course pages.",
      enabled: false,
      rolloutPercentage: 10,
      critical: false,
      updatedAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      key: "maintenance-mode",
      description: "Global read-only maintenance banner and write lock. Emergency use only.",
      enabled: false,
      rolloutPercentage: 100,
      critical: true,
      updatedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function getMockFlags(): FeatureFlag[] {
  if (!mockFlags) mockFlags = seedFlags();
  return mockFlags;
}

export async function listFlags(): Promise<{ flags: FeatureFlag[] }> {
  return withMockDelay({ flags: getMockFlags().map((flag) => ({ ...flag })) });
}

export interface CreateFlagPayload {
  key: string;
  description?: string;
  rolloutPercentage?: number;
  critical?: boolean;
}

export async function createFlag(payload: CreateFlagPayload): Promise<{ flag: FeatureFlag }> {
  const flag: FeatureFlag = {
    key: payload.key,
    description: payload.description || "",
    enabled: false,
    rolloutPercentage:
      typeof payload.rolloutPercentage === "number" ? payload.rolloutPercentage : 0,
    critical: Boolean(payload.critical),
    updatedAt: new Date().toISOString(),
  };
  getMockFlags().unshift(flag);
  return withMockDelay({ flag: { ...flag } });
}

export async function updateFlag(key: string, patch: Partial<Omit<FeatureFlag, "key" | "updatedAt">> = {}): Promise<{ flag: FeatureFlag }> {
  const flags = getMockFlags();
  const index = flags.findIndex((flag) => flag.key === key);
  if (index === -1) {
    await withMockDelay(null);
    throw new Error(`Unknown flag: ${key}`);
  }
  const updated: FeatureFlag = {
    ...flags[index],
    ...patch,
    key,
    updatedAt: new Date().toISOString(),
  };
  flags[index] = updated;
  return withMockDelay({ flag: { ...updated } });
}
