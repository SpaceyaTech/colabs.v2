import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';
import { Bell, Bookmark } from 'lucide-react';
import { workspaceItems, exploreItems } from '@/config/nav';

const navItems = [
  ...workspaceItems.map(i => ({ label: i.title, href: i.url, icon: i.icon })),
  ...exploreItems.map(i => ({ label: i.title, href: i.url, icon: i.icon })),
];

interface TopNavLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function TopNavLayout({ children, title, subtitle }: TopNavLayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return location.pathname + location.search === href;
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between border-b bg-background px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center space-x-2 mr-4">
            <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" className="absolute">
                <circle cx="12" cy="16" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.8"/>
                <circle cx="20" cy="16" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.4"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">Colabs</span>
          </Link>
          {title && (
            <>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="text-lg font-semibold">{title}</span>
              {subtitle && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-sm">{subtitle}</span>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <GlobalSearch />
          <Link 
            to="/notifications" 
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <Link 
            to="/saved-jobs" 
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bookmark className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-background sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className={cn("min-h-[calc(100vh-112px)]", isMobile && "pb-16")}>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && <BottomNav />}
    </div>
  );
}
