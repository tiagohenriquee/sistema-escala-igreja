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
              <div className="flex h-16 items-center justify-between px-6 lg:px-8">
                <div className="pl-12 lg:pl-0">
                  {title && (
                    <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
              </div>
            </header>
          )}

          <div className="p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
