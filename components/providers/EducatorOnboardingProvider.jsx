"use client";
/**
 * EducatorOnboardingProvider
 * ---------------------------
 * Shared state context for the educator onboarding wizard.
 *
 * What it holds
 * -------------
 *   step           — current wizard step index (1-based)
 *   consentRecord  — { consentAt, consentVersion } once the user consents;
 *                    null until then. Never leaves this context.
 *   verificationToken — short-lived opaque string returned by the liveness
 *                    adapter on success.  This is the ONLY artefact forwarded
 *                    to the backend. It is cleared as soon as the backend
 *                    acknowledges it (submitLiveness action).
 *                    RAW biometric data is never stored here.
 *
 * Security invariants (enforced by this module)
 * ---------------------------------------------
 *   1. verificationToken is never written to localStorage or a cookie.
 *   2. consentRecord is never written to localStorage or a cookie.
 *   3. Both values live in React state only and are GC-d with the component.
 */

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

/** @typedef {"idle"|"consenting"|"capturing"|"success"|"failure"|"timeout"} OnboardingPhase */

/**
 * @typedef {Object} OnboardingState
 * @property {number}                step
 * @property {OnboardingPhase}       phase
 * @property {{ consentAt: number, consentVersion: string } | null} consentRecord
 * @property {string | null}         verificationToken
 * @property {string | null}         errorMessage
 * @property {number}                retryCount
 */

/** @type {OnboardingState} */
const INITIAL_STATE = {
  step: 1,
  phase: "idle",
  consentRecord: null,
  verificationToken: null,
  errorMessage: null,
  retryCount: 0,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const ACTION = /** @type {const} */ ({
  NEXT_STEP: "NEXT_STEP",
  PREV_STEP: "PREV_STEP",
  GO_TO_STEP: "GO_TO_STEP",
  SET_PHASE: "SET_PHASE",
  RECORD_CONSENT: "RECORD_CONSENT",
  REVOKE_CONSENT: "REVOKE_CONSENT",
  SET_VERIFICATION_TOKEN: "SET_VERIFICATION_TOKEN",
  CLEAR_VERIFICATION_TOKEN: "CLEAR_VERIFICATION_TOKEN",
  SET_ERROR: "SET_ERROR",
  RETRY: "RETRY",
  RESET: "RESET",
});

function reducer(state, action) {
  switch (action.type) {
    case ACTION.NEXT_STEP:
      return { ...state, step: state.step + 1, errorMessage: null };

    case ACTION.PREV_STEP:
      return { ...state, step: Math.max(1, state.step - 1), errorMessage: null };

    case ACTION.GO_TO_STEP:
      return { ...state, step: action.payload, errorMessage: null };

    case ACTION.SET_PHASE:
      return { ...state, phase: action.payload, errorMessage: null };

    case ACTION.RECORD_CONSENT:
      return {
        ...state,
        consentRecord: {
          consentAt: action.payload.consentAt,
          consentVersion: action.payload.consentVersion,
        },
        phase: "capturing",
        errorMessage: null,
      };

    case ACTION.REVOKE_CONSENT:
      return {
        ...state,
        consentRecord: null,
        phase: "consenting",
        // Also clear any token if somehow present
        verificationToken: null,
      };

    case ACTION.SET_VERIFICATION_TOKEN:
      // SECURITY: this is the ONLY place a token is written.
      // It must never be forwarded to localStorage / sessionStorage / cookies
      // outside of submitLiveness, which clears it immediately after the
      // backend call.
      return {
        ...state,
        verificationToken: action.payload,
        phase: "success",
        errorMessage: null,
      };

    case ACTION.CLEAR_VERIFICATION_TOKEN:
      return { ...state, verificationToken: null };

    case ACTION.SET_ERROR:
      return {
        ...state,
        phase: action.payload.phase ?? "failure",
        errorMessage: action.payload.message ?? null,
        verificationToken: null,
      };

    case ACTION.RETRY:
      return {
        ...state,
        phase: "capturing",
        errorMessage: null,
        verificationToken: null,
        retryCount: state.retryCount + 1,
      };

    case ACTION.RESET:
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const EducatorOnboardingContext = createContext(null);

export function useEducatorOnboarding() {
  const ctx = useContext(EducatorOnboardingContext);
  if (!ctx) {
    throw new Error(
      "useEducatorOnboarding must be used inside <EducatorOnboardingProvider>"
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export default function EducatorOnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // ── Navigation ────────────────────────────────────────────────────────────
  const nextStep = useCallback(() => dispatch({ type: ACTION.NEXT_STEP }), []);
  const prevStep = useCallback(() => dispatch({ type: ACTION.PREV_STEP }), []);
  const goToStep = useCallback(
    (n) => dispatch({ type: ACTION.GO_TO_STEP, payload: n }),
    []
  );

  // ── Phase control ─────────────────────────────────────────────────────────
  const setPhase = useCallback(
    (phase) => dispatch({ type: ACTION.SET_PHASE, payload: phase }),
    []
  );

  // ── Consent ───────────────────────────────────────────────────────────────
  /**
   * Record that the user gave explicit consent.
   * @param {{ consentAt: number, consentVersion: string }} record
   */
  const recordConsent = useCallback(
    (record) => dispatch({ type: ACTION.RECORD_CONSENT, payload: record }),
    []
  );

  const revokeConsent = useCallback(
    () => dispatch({ type: ACTION.REVOKE_CONSENT }),
    []
  );

  // ── Verification token ────────────────────────────────────────────────────
  /**
   * Store the short-lived token returned by the adapter.
   * Call clearVerificationToken() immediately after the backend acknowledges.
   * @param {string} token
   */
  const setVerificationToken = useCallback(
    (token) =>
      dispatch({ type: ACTION.SET_VERIFICATION_TOKEN, payload: token }),
    []
  );

  const clearVerificationToken = useCallback(
    () => dispatch({ type: ACTION.CLEAR_VERIFICATION_TOKEN }),
    []
  );

  // ── Error / retry ─────────────────────────────────────────────────────────
  /**
   * @param {{ message?: string, phase?: "failure"|"timeout" }} opts
   */
  const setError = useCallback(
    (opts) => dispatch({ type: ACTION.SET_ERROR, payload: opts }),
    []
  );

  const retry = useCallback(() => dispatch({ type: ACTION.RETRY }), []);

  const reset = useCallback(() => dispatch({ type: ACTION.RESET }), []);

  const value = {
    // State (read-only outside reducer)
    ...state,
    // Actions
    nextStep,
    prevStep,
    goToStep,
    setPhase,
    recordConsent,
    revokeConsent,
    setVerificationToken,
    clearVerificationToken,
    setError,
    retry,
    reset,
  };

  return (
    <EducatorOnboardingContext.Provider value={value}>
      {children}
    </EducatorOnboardingContext.Provider>
  );
}
