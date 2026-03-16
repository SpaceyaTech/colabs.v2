import { useState } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeft, Plus, Users, Loader2 } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { CreateTeamDialog } from "@/components/dashboard/CreateTeamDialog";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { workspaceItems, exploreItems, bottomItems } from "@/config/nav";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const { teams, isLoading: teamsLoading } = useTeams();
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  const isCollapsed = state === 'collapsed';

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-accent text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground hover:bg-accent/50";

  const renderNavItem = (item: typeof workspaceItems[0]) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        className={`h-8 ${isCollapsed ? 'justify-center px-2' : 'justify-start px-2.5'}`}
      >
        <NavLink
          to={item.url}
          end={item.url === "/dashboard"}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md text-[13px] transition-colors px-2 py-1.5 ${getNavCls({ isActive }).trim()}`
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-background">
      <SidebarHeader className={`py-3 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 relative flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 32 32">
                  <circle cx="12" cy="16" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.8" />
                  <circle cx="20" cy="16" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-foreground">Colabs</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* My Workspace */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 px-2 mb-1">
              My Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {workspaceItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* My Teams */}
        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 mb-1">
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 p-0">
                My Teams
              </SidebarGroupLabel>
              <button
                onClick={() => setCreateTeamOpen(true)}
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                title="Create team"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {teamsLoading ? (
                <SidebarMenuItem>
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  </div>
                </SidebarMenuItem>
              ) : teams.length === 0 ? (
                <SidebarMenuItem>
                  {!isCollapsed ? (
                    <button
                      onClick={() => setCreateTeamOpen(true)}
                      className="flex items-center gap-2.5 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors px-2 py-1.5 w-full"
                    >
                      <Plus className="h-4 w-4 shrink-0" />
                      <span>Create a team</span>
                    </button>
                  ) : (
                    <SidebarMenuButton
                      className="justify-center px-2 h-8"
                      onClick={() => setCreateTeamOpen(true)}
                    >
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ) : (
                teams.map((team) => {
                  const teamUrl = `/dashboard/teams/${team.id}`;
                  const isActive = location.pathname === teamUrl;
                  return (
                    <SidebarMenuItem key={team.id}>
                      <SidebarMenuButton
                        asChild
                        className={`h-8 ${isCollapsed ? 'justify-center px-2' : 'justify-start px-2.5'}`}
                      >
                        <NavLink
                          to={teamUrl}
                          className={`flex items-center gap-2.5 rounded-md text-[13px] transition-colors px-2 py-1.5 ${
                            isActive
                              ? "bg-accent text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          }`}
                        >
                          <Users className="h-4 w-4 shrink-0" />
                          {!isCollapsed && <span className="truncate">{team.name}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
              {/* Show + button in collapsed mode when there are teams */}
              {isCollapsed && !teamsLoading && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="justify-center px-2 h-8"
                    onClick={() => setCreateTeamOpen(true)}
                  >
                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Explore */}
        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 px-2 mb-1">
              Explore
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {exploreItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        <SidebarMenu className="space-y-0.5">
          {bottomItems.map(renderNavItem)}
        </SidebarMenu>
      </SidebarFooter>

      <CreateTeamDialog open={createTeamOpen} onOpenChange={setCreateTeamOpen} />
    </Sidebar>
  );
}
