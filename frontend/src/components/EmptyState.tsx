import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      {subtitle ? <p className="muted">{subtitle}</p> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
