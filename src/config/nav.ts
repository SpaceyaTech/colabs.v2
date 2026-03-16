import { CircleDot, FolderOpen, Briefcase, BarChart3, FolderGit2, AlertCircle, Trophy, Settings } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: any;
};

export const workspaceItems: NavItem[] = [
  { title: "My Issues", url: "/dashboard", icon: CircleDot },
  { title: "My Projects", url: "/dashboard/projects", icon: FolderOpen },
  { title: "My Gigs", url: "/dashboard/gigs", icon: Briefcase },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

export const exploreItems: NavItem[] = [
  { title: "Explore Projects", url: "/projects", icon: FolderGit2 },
  { title: "Gigs", url: "/marketplace", icon: Briefcase },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
];

export const bottomItems: NavItem[] = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];
