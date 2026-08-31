import { toast } from "sonner";

export const ADMIN_TOAST_DURATIONS = Object.freeze({
  success: 4000,
  error: 6000,
  info: 4000,
});

export interface AdminToastAction {
  label: string;
  onClick: () => void;
}

export interface AdminToastOptions {
  title: string;
  description?: string;
  action?: AdminToastAction;
}

function buildOptions({
  description,
  action,
  duration,
}: {
  description?: string;
  action?: AdminToastAction;
  duration: number;
}) {
  const options: { duration: number; description?: string; action?: { label: string; onClick: () => void } } = { duration };
  if (description) options.description = description;
  if (action) {
    options.action = { label: action.label, onClick: action.onClick };
  }
  return options;
}

export function adminToastSuccess({ title, description, action }: AdminToastOptions = { title: "" }): void {
  toast.success(title, buildOptions({ description, action, duration: ADMIN_TOAST_DURATIONS.success }));
}

export function adminToastError({ title, description, action }: AdminToastOptions = { title: "" }): void {
  toast.error(title, buildOptions({ description, action, duration: ADMIN_TOAST_DURATIONS.error }));
}

export function adminToastInfo({ title, description }: { title: string; description?: string } = { title: "" }): void {
  toast.info(title, buildOptions({ description, duration: ADMIN_TOAST_DURATIONS.info }));
}
