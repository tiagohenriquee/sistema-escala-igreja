import { ReactNode } from "react";

import { Sidebar } from "@/components/sidebar";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function AppLayout({ children, title, description, actions }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:pl-64">
        <div className="min-h-screen">
          {(title || actions) && (
            <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 pl-16 pr-4 sm:pr-6 lg:px-8">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
                  )}
                  {description && (
                    <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
                  )}
                </div>
                {actions && (
                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">{actions}</div>
                )}
              </div>
            </header>
          )}

          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
