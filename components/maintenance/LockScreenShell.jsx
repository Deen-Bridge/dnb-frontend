/**
 * LockScreenShell — the shared full-screen "friendly lock" visual shell.
 * ---------------------------------------------------------------------------
 * Extracted verbatim from the original offline page (#303) so the offline
 * screen and the new maintenance lock screen (`MaintenanceScreen`) share one
 * gradient container + centered icon card + heading/description layout instead
 * of duplicating it. Purely presentational and framework-agnostic — it takes an
 * icon node, a heading, a description, optional body `children` (rendered
 * between the description and the footer), and an optional `footer` node.
 *
 * The markup below is byte-for-byte the offline page's wrapper so adopting the
 * shell does not change the offline screen's appearance.
 */
import { cn } from "@/lib/utils";

/**
 * @param {object} props
 * @param {React.ReactNode} props.icon      Icon node rendered inside the accent card (size it `h-10 w-10`).
 * @param {React.ReactNode} props.title     Main heading text.
 * @param {React.ReactNode} [props.description] Sub-heading paragraph under the title.
 * @param {React.ReactNode} [props.children] Optional body content between description and footer.
 * @param {React.ReactNode} [props.footer]  Optional muted footer line.
 * @param {string} [props.className]         Extra classes for the outer gradient container.
 */
export default function LockScreenShell({
  icon,
  title,
  description,
  children,
  footer,
  className,
}) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-6 text-center",
        className
      )}
    >
      <div className="max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
            {icon}
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-foreground">{title}</h1>
        {description ? (
          <p className="mb-8 text-muted-foreground">{description}</p>
        ) : null}

        {children}

        {footer ? (
          <p className="mt-8 text-xs text-muted-foreground">{footer}</p>
        ) : null}
      </div>
    </div>
  );
}
