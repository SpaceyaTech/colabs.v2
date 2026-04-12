import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitPullRequest, GitCommit, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  owner: string;
  avatar?: string;
  language: string;
  stars: number;
  prsCount: number;
  commitsCount: number;
  role: 'contributor' | 'maintainer' | 'owner';
}

interface ProjectsContributedListProps {
  projects: Project[];
}

export function ProjectsContributedList({ projects }: ProjectsContributedListProps) {
  const getRoleBadgeVariant = (role: Project['role']) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'maintainer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects Contributed To</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map(project => (
          <div
            key={project.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={project.avatar} alt={project.name} />
                <AvatarFallback className="text-xs">
                  {project.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {project.owner}/{project.name}
                  </span>
                  <Badge variant={getRoleBadgeVariant(project.role)} className="text-xs capitalize">
                    {project.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    {project.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {project.stars}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <GitPullRequest className="h-4 w-4 text-primary" />
                <span>{project.prsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitCommit className="h-4 w-4 text-green-500" />
                <span>{project.commitsCount}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
