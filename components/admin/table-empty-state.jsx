import { EmptyState } from "@/components/ui/empty-state";

export function TableEmptyState({ icon, title, description, action }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  );
}
