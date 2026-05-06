import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Github,
  ExternalLink,
  TrendingUp,
  GitPullRequest,
  GitCommit,
  Clock,
  FolderGit2,
  Star,
} from 'lucide-react';
import { ContributionHeatmap } from '@/components/profile/ContributionHeatmap';
import { Progress } from '@/components/ui/progress';

// Mock data
const mockContributionStats = {
  totalPRs: 47,
  totalCommits: 342,
  hoursContributed: 156,
  projectsContributed: 12,
};

const mockTechStack = [
  { name: 'TypeScript', proficiency: 92, projects: 8, color: 'hsl(var(--primary))' },
  { name: 'React', proficiency: 88, projects: 7, color: 'hsl(var(--primary))' },
  { name: 'Python', proficiency: 75, projects: 4, color: 'hsl(var(--primary))' },
  { name: 'Node.js', proficiency: 82, projects: 5, color: 'hsl(var(--primary))' },
  { name: 'PostgreSQL', proficiency: 70, projects: 3, color: 'hsl(var(--primary))' },
];

const mockProjectsContributed = [
  {
    id: '1',
    name: 'react',
    owner: 'facebook',
    language: 'TypeScript',
    stars: 218000,
    prsCount: 12,
    commitsCount: 45,
    role: 'contributor' as const,
  },
  {
    id: '2',
    name: 'next.js',
    owner: 'vercel',
    language: 'TypeScript',
    stars: 115000,
    prsCount: 8,
    commitsCount: 23,
    role: 'contributor' as const,
  },
  {
    id: '3',
    name: 'my-oss-project',
    owner: 'user',
    language: 'Python',
    stars: 342,
    prsCount: 25,
    commitsCount: 156,
    role: 'owner' as const,
  },
  {
    id: '4',
    name: 'supabase',
    owner: 'supabase',
    language: 'TypeScript',
    stars: 58000,
    prsCount: 2,
    commitsCount: 8,
    role: 'contributor' as const,
  },
];

const recentActivity = [
  {
    action: 'Merged PR #1234',
    detail: 'facebook/react — Fix memory leak in useEffect',
    time: '2 hours ago',
    color: 'bg-primary',
  },
  {
    action: '5 commits pushed',
    detail: 'user/my-oss-project — Add new API endpoints',
    time: '5 hours ago',
    color: 'bg-green-500',
  },
  {
    action: 'Opened PR #567',
    detail: 'vercel/next.js — Improve build performance',
    time: '1 day ago',
    color: 'bg-blue-500',
  },
  {
    action: 'Started contributing',
    detail: 'supabase/supabase — First contribution',
    time: '3 days ago',
    color: 'bg-muted-foreground',
  },
];

const generateHeatmapData = () => {
  const data = [];
  const today = new Date();
  for (let i = 140; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: Math.floor(Math.random() * 12),
    });
  }
  return data;
};

// Evaluated once at module load — keeps Date.now() completely outside React's
// render cycle (react-hooks/purity disallows impure function calls during render)
const MODULE_LOAD_TIMESTAMP = Date.now();

export default function Profile() {
  const { user } = useAuth();
  const [heatmapData] = useState(generateHeatmapData);

  useEffect(() => {
    document.title = 'My Profile - OSS Contributions';
  }, []);

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  // Falls back to MODULE_LOAD_TIMESTAMP — a stable value computed outside React
  const joinedDate = new Date(user?.created_at ?? MODULE_LOAD_TIMESTAMP).toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric' }
  );
  const currentStreak = 12;

  return (
    <AuthGuard>
      <AppLayout>
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-start gap-5 mb-6">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Contributor'}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Joined {joinedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Github className="h-3.5 w-3.5" />{' '}
                      {user?.email?.split('@')[0] || 'contributor'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Github className="h-4 w-4 mr-2" />
                    View GitHub
                  </Button>
                  <Button size="sm">Edit Profile</Button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {currentStreak} day streak
                </Badge>
                <Badge variant="secondary" className="text-xs font-normal">
                  Top 10% Contributor
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {mockContributionStats.projectsContributed} Projects
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Stats row — Linear style flat counters */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[
              {
                icon: GitPullRequest,
                label: 'Pull Requests',
                value: mockContributionStats.totalPRs,
              },
              { icon: GitCommit, label: 'Commits', value: mockContributionStats.totalCommits },
              { icon: Clock, label: 'Hours Coded', value: mockContributionStats.hoursContributed },
              {
                icon: FolderGit2,
                label: 'Projects',
                value: mockContributionStats.projectsContributed,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <ContributionHeatmap data={heatmapData} />

          {/* Two column: Tech Stack + Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Tech Stack */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Tech Stack
              </h2>
              <div className="space-y-3">
                {mockTechStack.map((tech) => (
                  <div key={tech.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{tech.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {tech.projects} projects
                      </span>
                    </div>
                    <Progress value={tech.proficiency} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className={`h-2 w-2 rounded-full ${item.color}`} />
                      {i < recentActivity.length - 1 && (
                        <div className="h-full w-px bg-border mt-1" />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Contributed */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Projects Contributed
              </h2>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                View All
              </Button>
            </div>
            <div className="border border-border rounded-lg divide-y divide-border">
              {mockProjectsContributed.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {project.owner}/{project.name}
                        </span>
                        <Badge
                          variant={project.role === 'owner' ? 'default' : 'outline'}
                          className="text-[10px] capitalize"
                        >
                          {project.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{project.language}</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3" />
                          {project.stars.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitPullRequest className="h-3.5 w-3.5" />
                      {project.prsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="h-3.5 w-3.5" />
                      {project.commitsCount}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
