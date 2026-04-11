import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BottomNav } from '@/components/BottomNav';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="h-12 flex items-center justify-end border-b bg-background px-4 sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </header>
        <div
          className={`flex-1 min-h-[calc(100svh-48px)] bg-background ${isMobile ? 'pb-16' : ''}`}
        >
          {children}
        </div>
        {isMobile && <BottomNav />}
      </SidebarInset>
    </SidebarProvider>
  );
}
