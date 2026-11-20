import { config } from "@/lib/config/env";
import { LivenessAdapter } from "./adapter";
import { MockLivenessAdapter } from "./mock-adapter";
import { PersonaLivenessAdapter } from "./persona-adapter";
import { OnfidoLivenessAdapter } from "./onfido-adapter";

export function getLivenessAdapter(): LivenessAdapter {
  const provider = config.livenessProvider;

  switch (provider) {
    case "persona":
      return new PersonaLivenessAdapter();
    case "onfido":
      return new OnfidoLivenessAdapter();
    case "mock":
      return new MockLivenessAdapter();
    default:
      throw new Error(`Liveness provider "${provider}" is unavailable.`);
  }
}

export { LivenessAdapter } from "./adapter";
export { MockLivenessAdapter } from "./mock-adapter";
