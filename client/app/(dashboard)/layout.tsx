'use client';

import { ProtectedRoute } from '@/components/shared/protected-route';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { WebSocketProvider } from '@/lib/websocket';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <WebSocketProvider>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <AppHeader />
              <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </WebSocketProvider>
    </ProtectedRoute>
  );
}
