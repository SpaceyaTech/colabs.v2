import { useEffect } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAnalytics } from '@/hooks/useAnalytics';
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
  Loader2,
} from 'lucide-react';
import { ContributionHeatmap } from '@/components/profile/ContributionHeatmap';
import { Progress } from '@/components/ui/progress';

export default function Profile() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  useEffect(() => {
    document.title = `${profile?.full_name || 'My Profile'} - OSS Contributions`;
  }, [profile]);

  if (profileLoading || analyticsLoading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading profile data...</p>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  const userInitials = profile?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U';
  const joinedDate = new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  
  // Real stats from analytics
  const stats = analytics?.stats || {
    totalPRs: 0,
    totalCommits: 0,
    hoursContributed: 0,
    projectsContributed: 0
  };

  const currentStreak = 0; // TBD: Implement streak logic

  return (
    <AuthGuard>
      <AppLayout>
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-start gap-5 mb-6">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold">
                    {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Contributor'}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Joined {joinedDate}
                    </span>
                    {profile?.github_username && (
                      <span className="flex items-center gap-1">
                        <Github className="h-3.5 w-3.5" />{' '}
                        {profile.github_username}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {profile?.github_username && (
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://github.com/${profile.github_username}`, '_blank')}>
                      <Github className="h-4 w-4 mr-2" />
                      View GitHub
                    </Button>
                  )}
                  <Button size="sm" onClick={() => window.location.href = '/settings'}>Edit Profile</Button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {currentStreak} day streak
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {stats.projectsContributed} Projects
                </Badge>
                {profile?.tech_stack?.slice(0, 3).map(tech => (
                  <Badge key={tech} variant="secondary" className="text-xs font-normal">
                    {tech}
                  </Badge>
                ))}
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
                value: stats.totalPRs,
              },
              { icon: GitCommit, label: 'Commits', value: stats.totalCommits },
              { icon: Clock, label: 'Hours Coded', value: stats.hoursContributed },
              {
                icon: FolderGit2,
                label: 'Projects',
                value: stats.projectsContributed,
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
          <ContributionHeatmap data={analytics?.heatmapData || []} />

          {/* Two column: Tech Stack + Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Tech Stack */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Tech Stack
              </h2>
              <div className="space-y-3">
                {analytics?.techStack.map((tech) => (
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
                {(!analytics?.techStack || analytics.techStack.length === 0) && (
                  <p className="text-xs text-muted-foreground">No tech stack data yet. Start claiming issues to see analytics.</p>
                )}
              </div>
            </div>

            {/* Recent Activity - Static for now, can be linked to an activity log table later */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground italic">Activity logging coming soon in Phase 2.</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
