import { StellarWalletInfo, StellarTransaction, StellarPaymentInitResponse, StellarPaymentSubmitResponse } from "./api";

export type { StellarWalletInfo, StellarTransaction, StellarPaymentInitResponse, StellarPaymentSubmitResponse };

export interface StellarPreCheckIssue {
  title: string;
  message: string;
  nextStep?: string;
  type: "no_wallet" | "network" | "trustline" | "balance" | string;
}

export interface StellarPaymentOptions {
  itemType: "course" | "book" | string;
  itemId: string;
}

export type PaymentInitializationParams = {
  itemType: "course" | "book" | string;
  itemId: string;
  buyerWallet?: string;
};

export type PaymentInitializationResponse = StellarPaymentInitResponse;
export type PaymentSubmissionResponse = StellarPaymentSubmitResponse;

export interface ExecutePaymentResult {
  success: boolean;
  data?: any; // TODO(types): Raw backend response data payload
  cancelled?: boolean;
  transaction?: {
    hash: string;
    explorerUrl?: string;
  };
}

export interface StellarContextType {
  kitInitialized: boolean;
  connectedWallet: string | null;
  walletInfo: StellarWalletInfo | null;
  isConnecting: boolean;
  isLoading: boolean;
  hasWalletExtension: boolean;
  walletNetwork: string | null;
  networkMismatch: boolean;
  connectWallet: () => Promise<void>;
  selectWallet: () => Promise<string>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>;
  validateForPayment: (price?: number | string) => Promise<StellarPreCheckIssue[]>;
  network: string;
  expectedNetworkPassphrase: string;
}

export interface StellarErrorDescriptor {
  title: string;
  message: string;
  nextStep?: string;
  type: string;
}

export type StellarErrorDetail = StellarErrorDescriptor;
