import { describe, it, expect } from "vitest";
import {
  mapStellarError,
  isNoWalletError,
  isUserRejection,
  STELLAR_ERRORS,
  WALLET_ERRORS,
  WALLET_INSTALL_LINKS,
} from "@/lib/stellar/stellarErrors";

describe("stellarErrors utilities", () => {
  describe("mapStellarError", () => {
    it("returns null for falsy error inputs", () => {
      expect(mapStellarError(null)).toBeNull();
      expect(mapStellarError(undefined)).toBeNull();
      expect(mapStellarError("")).toBeNull();
    });

    it("maps op_no_trust error to trustline required info", () => {
      const mapped = mapStellarError("Error: op_no_trust operation failed");
      expect(mapped).toEqual(STELLAR_ERRORS.op_no_trust);
      expect(mapped.type).toBe("trustline");
      expect(mapped.title).toBe("USDC Trustline Required");
    });

    it("maps op_underfunded error to insufficient balance info", () => {
      const mapped = mapStellarError(new Error("Transaction failed with op_underfunded"));
      expect(mapped).toEqual(STELLAR_ERRORS.op_underfunded);
      expect(mapped.type).toBe("balance");
    });

    it("maps op_low_reserve error to low XLM reserve info", () => {
      const mapped = mapStellarError("Horizon response: op_low_reserve");
      expect(mapped).toEqual(STELLAR_ERRORS.op_low_reserve);
      expect(mapped.title).toBe("Insufficient XLM Reserve");
    });

    it("maps tx_bad_auth error to authentication failure", () => {
      const mapped = mapStellarError("tx_bad_auth");
      expect(mapped).toEqual(STELLAR_ERRORS.tx_bad_auth);
      expect(mapped.type).toBe("auth");
    });

    it("maps tx_bad_seq error to sequence mismatch", () => {
      const mapped = mapStellarError("tx_bad_seq");
      expect(mapped).toEqual(STELLAR_ERRORS.tx_bad_seq);
      expect(mapped.type).toBe("sequence");
    });

    it("maps tx_insufficient_fee error", () => {
      const mapped = mapStellarError("tx_insufficient_fee");
      expect(mapped).toEqual(STELLAR_ERRORS.tx_insufficient_fee);
      expect(mapped.type).toBe("fee");
    });

    it("maps tx_not_supported error", () => {
      const mapped = mapStellarError("tx_not_supported");
      expect(mapped).toEqual(STELLAR_ERRORS.tx_not_supported);
    });

    it("maps user cancellation/rejection keywords", () => {
      expect(mapStellarError("User rejected the transaction")).toEqual(
        WALLET_ERRORS.user_rejected
      );
      expect(mapStellarError(new Error("Transaction cancelled by user"))).toEqual(
        WALLET_ERRORS.user_rejected
      );
      expect(mapStellarError("Request was declined")).toEqual(
        WALLET_ERRORS.user_rejected
      );
      expect(mapStellarError("Access denied")).toEqual(
        WALLET_ERRORS.user_rejected
      );
    });

    it("maps insufficient balance keyword errors", () => {
      expect(mapStellarError("insufficient funds for operation")).toEqual(
        WALLET_ERRORS.insufficient_balance
      );
      expect(mapStellarError("account is underfunded")).toEqual(
        WALLET_ERRORS.insufficient_balance
      );
    });

    it("maps generic trustline keyword errors", () => {
      expect(mapStellarError("trustline not found")).toEqual(
        WALLET_ERRORS.trustline_missing
      );
    });

    it("maps network mismatch keyword errors", () => {
      expect(mapStellarError("network mismatch between wallet and app")).toEqual(
        WALLET_ERRORS.network_mismatch
      );
    });

    it("returns null for unrecognized errors", () => {
      expect(mapStellarError("Internal server 500 error")).toBeNull();
    });
  });

  describe("isNoWalletError", () => {
    it("returns false for empty input", () => {
      expect(isNoWalletError(null)).toBe(false);
      expect(isNoWalletError(undefined)).toBe(false);
      expect(isNoWalletError("")).toBe(false);
    });

    it("identifies no wallet errors correctly", () => {
      expect(isNoWalletError("no wallet found")).toBe(true);
      expect(isNoWalletError("no extension detected")).toBe(true);
      expect(isNoWalletError("wallet not installed")).toBe(true);
      expect(isNoWalletError(new Error("Cannot read properties of undefined"))).toBe(true);
      expect(isNoWalletError({ code: -1, message: "unknown" })).toBe(true);
    });

    it("returns false for unrelated errors", () => {
      expect(isNoWalletError("Transaction rejected by signer")).toBe(false);
      expect(isNoWalletError({ code: 4001, message: "Declined" })).toBe(false);
    });
  });

  describe("isUserRejection", () => {
    it("returns false for empty input", () => {
      expect(isUserRejection(null)).toBe(false);
      expect(isUserRejection(undefined)).toBe(false);
      expect(isUserRejection("")).toBe(false);
    });

    it("identifies user rejection by message and code", () => {
      expect(isUserRejection("User rejected the prompt")).toBe(true);
      expect(isUserRejection("Signing cancelled")).toBe(true);
      expect(isUserRejection("Transaction declined")).toBe(true);
      expect(isUserRejection("Signature denied")).toBe(true);
      expect(isUserRejection(new Error("User declined the transaction"))).toBe(true);
      expect(isUserRejection({ code: 4001, message: "EIP-1193 style rejection" })).toBe(true);
      expect(isUserRejection({ code: -1, message: "Generic rejection" })).toBe(true);
    });

    it("returns false for network or server errors", () => {
      expect(isUserRejection("Connection timeout")).toBe(false);
      expect(isUserRejection({ code: 500, message: "Server error" })).toBe(false);
    });
  });

  describe("WALLET_INSTALL_LINKS", () => {
    it("exports valid links for Freighter, xBull, and Albedo", () => {
      expect(WALLET_INSTALL_LINKS.freighter.url).toBe("https://www.freighter.app/");
      expect(WALLET_INSTALL_LINKS.xbull.url).toBe("https://xbull.app/");
      expect(WALLET_INSTALL_LINKS.albedo.url).toBe("https://albedo.link/");
    });
  });
});
