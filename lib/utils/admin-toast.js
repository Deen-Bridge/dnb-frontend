/**
 * Centralized admin toast wrapper (#333).
 * ---------------------------------------------------------------------------
 * Single seam for sonner toasts across all admin mutations so copy, timing,
 * and action affordances stay consistent:
 *
 *   - Success toasts can carry an optional **Undo** action for reversible
 *     actions (visibility toggles, publish states).
 *   - Error toasts can carry an optional **Retry** action so destructive
 *     failures offer a retry affordance, not just text.
 *
 * Uniform durations: successes/neutral info get 4s; errors get 6s so there's
 * time to read the message and reach the retry action.
 */
import { toast } from "sonner";

export const ADMIN_TOAST_DURATIONS = Object.freeze({
  success: 4000,
  error: 6000,
  info: 4000,
});

function buildOptions({ description, action, duration }) {
  const options = { duration };
  if (description) options.description = description;
  if (action) {
    options.action = { label: action.label, onClick: action.onClick };
  }
  return options;
}

/**
 * Success toast with uniform copy/timing and an optional Undo action.
 *
 * @param {{title: string, description?: string, action?: {label: string, onClick: () => void}}} options
 */
export function adminToastSuccess({ title, description, action } = {}) {
  toast.success(title, buildOptions({ description, action, duration: ADMIN_TOAST_DURATIONS.success }));
}

/**
 * Error toast with uniform copy/timing and an optional Retry action.
 *
 * @param {{title: string, description?: string, action?: {label: string, onClick: () => void}}} options
 */
export function adminToastError({ title, description, action } = {}) {
  toast.error(title, buildOptions({ description, action, duration: ADMIN_TOAST_DURATIONS.error }));
}

/**
 * Neutral info toast with uniform copy/timing.
 *
 * @param {{title: string, description?: string}} options
 */
export function adminToastInfo({ title, description } = {}) {
  toast.info(title, buildOptions({ description, duration: ADMIN_TOAST_DURATIONS.info }));
}
