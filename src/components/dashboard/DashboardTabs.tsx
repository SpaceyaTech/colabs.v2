import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  CircleDot,
  FolderGit2,
  Briefcase,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'issues', label: 'Issues', icon: CircleDot },
    { id: 'projects', label: 'OSS Projects', icon: FolderGit2 },
    { id: 'gigs', label: 'Gigs', icon: Briefcase },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="border-b border-border/40 bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-colors"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
