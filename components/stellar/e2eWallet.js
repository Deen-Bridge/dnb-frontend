/**
 * E2E test-mode wallet — replaces StellarWalletsKit when
 * NEXT_PUBLIC_E2E_WALLET=true.
 *
 * This module provides a minimal implementation of the wallet interface
 * used by StellarProvider so tests can drive the payment flow without
 * a browser-extension wallet installed.
 *
 * It resolves a fixed testnet public key from authModal() and returns
 * a passthrough XDR from signTransaction() (since the mocked backend
 * does not verify signatures).
 *
 * Guarded by process.env so it tree-shakes in production builds.
 */

const E2E_PUBLIC_KEY = "GA7QYNF7SOWQ3GLR2GMK2G5TTF2JRTTN2KXT3KGYRK3H4X2BYKT4QXYZ";

export const E2E_WALLET_ID = "e2e-test-wallet";

export class E2EWalletModule {
  constructor() {
    this.id = E2E_WALLET_ID;
    this.name = "E2E Test Wallet";
    this.type = "e2e";
  }

  /**
   * Return a fixed testnet public key (no modal).
   */
  async authModal() {
    return { address: E2E_PUBLIC_KEY };
  }

  /**
   * Return the signed XDR as-is (passthrough — mocked backend doesn't verify).
   */
  async signTransaction(xdr, opts) {
    return { signedTxXdr: xdr };
  }

  /**
   * No-op disconnect.
   */
  async disconnect() {
    // Nothing to disconnect
  }
}

/**
 * Factory: create an E2E wallet kit instance.
 * Only call this when NEXT_PUBLIC_E2E_WALLET=true.
 */
export function createE2EWalletKit() {
  const module = new E2EWalletModule();
  return {
    kitInitialized: true,
    selectedWalletId: E2E_WALLET_ID,
    modules: [module],

    async init() {
      return true;
    },

    async authModal() {
      return module.authModal();
    },

    async signTransaction(xdr, opts) {
      return module.signTransaction(xdr, opts);
    },

    disconnect() {
      module.disconnect();
    },
  };
}
