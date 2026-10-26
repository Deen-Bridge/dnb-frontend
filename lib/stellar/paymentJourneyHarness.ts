export type JourneyStep =
  | "disconnected"
  | "wallet_connected"
  | "intent_initialized"
  | "xdr_signed"
  | "submitted_verified";

export interface TestnetPaymentJourneyState {
  step: JourneyStep;
  walletPublicKey: string | null;
  intentId: string | null;
  signedXdr: string | null;
  txHash: string | null;
}

export function runTestnetPaymentHappyPath(input: {
  walletPublicKey: string;
  intentId: string;
  unsignedXdr: string;
  txHash: string;
}): TestnetPaymentJourneyState[] {
  const history: TestnetPaymentJourneyState[] = [
    {
      step: "disconnected",
      walletPublicKey: null,
      intentId: null,
      signedXdr: null,
      txHash: null,
    },
    {
      step: "wallet_connected",
      walletPublicKey: input.walletPublicKey,
      intentId: null,
      signedXdr: null,
      txHash: null,
    },
    {
      step: "intent_initialized",
      walletPublicKey: input.walletPublicKey,
      intentId: input.intentId,
      signedXdr: null,
      txHash: null,
    },
    {
      step: "xdr_signed",
      walletPublicKey: input.walletPublicKey,
      intentId: input.intentId,
      signedXdr: `signed:${input.unsignedXdr}`,
      txHash: null,
    },
    {
      step: "submitted_verified",
      walletPublicKey: input.walletPublicKey,
      intentId: input.intentId,
      signedXdr: `signed:${input.unsignedXdr}`,
      txHash: input.txHash,
    },
  ];
  return history;
}
