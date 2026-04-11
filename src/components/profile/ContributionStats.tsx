import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitPullRequest, GitCommit, Clock, FolderGit2 } from 'lucide-react';

interface ContributionStatsProps {
  stats: {
    totalPRs: number;
    totalCommits: number;
    hoursContributed: number;
    projectsContributed: number;
  };
}

export function ContributionStats({ stats }: ContributionStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
          <GitPullRequest className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPRs}</div>
          <p className="text-xs text-muted-foreground">Merged PRs</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commits</CardTitle>
          <GitCommit className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCommits}</div>
          <p className="text-xs text-muted-foreground">Total commits</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hours Coded</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.hoursContributed}</div>
          <p className="text-xs text-muted-foreground">This year</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projects</CardTitle>
          <FolderGit2 className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.projectsContributed}</div>
          <p className="text-xs text-muted-foreground">Contributed to</p>
        </CardContent>
      </Card>
    </div>
  );
}
