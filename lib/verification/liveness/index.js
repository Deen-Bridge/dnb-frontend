/**
 * Liveness Adapter Factory
 * -------------------------
 * Returns the correct adapter instance based on the NEXT_PUBLIC_LIVENESS_PROVIDER
 * config value.  UI components import `getLivenessAdapter` from here — they
 * never reference a vendor module directly.
 *
 * Swapping providers requires only:
 *   1. Setting NEXT_PUBLIC_LIVENESS_PROVIDER to the new value.
 *   2. Completing the stub in the corresponding adapter file.
 *
 * No UI change is ever needed.
 */

import { config } from "@/lib/config/env";
import { MockLivenessAdapter } from "./mock-adapter";

/** @returns {import("./adapter").LivenessAdapter} */
export function getLivenessAdapter() {
  const provider = config.livenessProvider;

  switch (provider) {
    case "persona": {
      // Dynamically require so the Persona SDK bundle is never loaded unless
      // the provider is explicitly configured.
      const { PersonaLivenessAdapter } = require("./persona-adapter");
      return new PersonaLivenessAdapter();
    }
    case "onfido": {
      const { OnfidoLivenessAdapter } = require("./onfido-adapter");
      return new OnfidoLivenessAdapter();
    }
    case "mock":
    default:
      return new MockLivenessAdapter();
  }
}

// Re-export the interface so callers can use it for type-checking / JSDoc.
export { LivenessAdapter } from "./adapter";
export { MockLivenessAdapter } from "./mock-adapter";
