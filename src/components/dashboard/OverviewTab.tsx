import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Calendar,
  User,
  CircleDot,
  Circle,
  CheckCircle2,
  Timer,
  ArrowRight,
} from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: { name: string; avatar: string };
  repo: { name: string; owner: string };
  labels: string[];
  createdAt: string;
  comments: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  technologies: string[];
  project_type: string;
  visibility: string;
  is_paid: boolean;
  status: string;
  created_at: string;
}

interface OverviewTabProps {
  projects: Project[];
}

const mockIssues: Issue[] = [
  {
    id: 'COL-12',
    title: 'Implement user authentication flow',
    description: 'Create a comprehensive authentication system.',
    status: 'in-progress',
    priority: 'urgent',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'web-app', owner: 'company' },
    labels: ['backend', 'auth'],
    createdAt: '2024-01-15',
    comments: 3,
  },
  {
    id: 'COL-14',
    title: 'Optimize database queries for dashboard',
    description: 'Some queries are taking too long.',
    status: 'in-progress',
    priority: 'high',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'api-server', owner: 'backend' },
    labels: ['performance'],
    createdAt: '2024-01-12',
    comments: 5,
  },
  {
    id: 'COL-18',
    title: 'Add payment integration tests',
    description: 'Write comprehensive tests for the payment flow.',
    status: 'in-progress',
    priority: 'medium',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'payments', owner: 'fintech' },
    labels: ['testing'],
    createdAt: '2024-01-13',
    comments: 2,
  },
  {
    id: 'COL-21',
    title: 'Fix responsive layout on mobile devices',
    description: 'Header navigation breaks on small screens.',
    status: 'todo',
    priority: 'high',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'ui-lib', owner: 'design' },
    labels: ['bug', 'frontend'],
    createdAt: '2024-01-14',
    comments: 1,
  },
  {
    id: 'COL-23',
    title: 'Setup CI/CD pipeline for staging',
    description: 'Configure automated deployment.',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'infra', owner: 'devops' },
    labels: ['devops'],
    createdAt: '2024-01-10',
    comments: 0,
  },
  {
    id: 'COL-25',
    title: 'Design system color token audit',
    description: 'Review and update color tokens.',
    status: 'todo',
    priority: 'low',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'design-system', owner: 'design' },
    labels: ['design'],
    createdAt: '2024-01-16',
    comments: 0,
  },
  {
    id: 'COL-09',
    title: 'Update onboarding documentation',
    description: 'Add new getting started guide.',
    status: 'done',
    priority: 'low',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'docs', owner: 'team' },
    labels: ['docs'],
    createdAt: '2024-01-08',
    comments: 4,
  },
  {
    id: 'COL-07',
    title: 'Migrate to TypeScript strict mode',
    description: 'Enable strict in tsconfig.',
    status: 'done',
    priority: 'medium',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'web-app', owner: 'company' },
    labels: ['dx'],
    createdAt: '2024-01-06',
    comments: 6,
  },
];

// Mock enriched data for recommended projects
const projectMeta: Record<
  string,
  { stars: number; forks: number; contributors: number; lastActive: string }
> = {};

const getProjectMeta = (id: string) => {
  if (!projectMeta[id]) {
    const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    projectMeta[id] = {
      stars: 50 + ((seed * 17) % 500),
      forks: 5 + ((seed * 7) % 120),
      contributors: 2 + ((seed * 3) % 30),
      lastActive: ['2h ago', '5h ago', '1d ago', '3d ago', '1w ago'][seed % 5],
    };
  }
  return projectMeta[id];
};

const priorityIcon = (p: Issue['priority']) => {
  switch (p) {
    case 'urgent':
      return <span className="text-destructive">⚡</span>;
    case 'high':
      return <span className="text-orange-400">▲</span>;
    case 'medium':
      return <span className="text-yellow-400">■</span>;
    case 'low':
      return <span className="text-muted-foreground">▽</span>;
  }
};

const statusIcon = (s: Issue['status']) => {
  switch (s) {
    case 'in-progress':
      return <Timer className="h-3.5 w-3.5 text-yellow-400 shrink-0" />;
    case 'todo':
      return <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    case 'done':
      return <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />;
    default:
      return <CircleDot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
};

const statusLabel: Record<Issue['status'], string> = {
  'in-progress': 'In Progress',
  todo: 'Todo',
  'in-review': 'In Review',
  done: 'Done',
};

const getPriorityColor = (priority: Issue['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'text-destructive';
    case 'high':
      return 'text-orange-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-muted-foreground';
  }
};

export function OverviewTab({ projects }: OverviewTabProps) {
  const navigate = useNavigate();

  const groups: { status: Issue['status']; issues: Issue[] }[] = [
    { status: 'in-progress', issues: mockIssues.filter(i => i.status === 'in-progress') },
    { status: 'todo', issues: mockIssues.filter(i => i.status === 'todo') },
    { status: 'done', issues: mockIssues.filter(i => i.status === 'done') },
  ];

  const renderIssueRow = (issue: Issue) => (
    <Sheet key={issue.id}>
      <SheetTrigger asChild>
        <button className="w-full flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2.5 sm:py-2 text-left hover:bg-accent/50 transition-colors rounded-md group text-[13px]">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
            {priorityIcon(issue.priority)}
            <span className="text-muted-foreground font-mono text-xs shrink-0">{issue.id}</span>
            {statusIcon(issue.status)}
            <span className="flex-1 truncate text-foreground">{issue.title}</span>
          </div>
          <div className="flex items-center gap-1.5 pl-5 sm:pl-0">
            {issue.labels.slice(0, 2).map(l => (
              <span
                key={l}
                className="text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground"
              >
                {l}
              </span>
            ))}
            <span className="text-xs text-muted-foreground/60 shrink-0 ml-auto sm:ml-0">
              {new Date(issue.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </button>
      </SheetTrigger>
      <SheetContent className="w-[85vw] sm:w-[500px]" side="right">
        <SheetHeader>
          <SheetTitle className="text-left font-mono text-sm text-muted-foreground">
            {issue.id}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-5">
          <h2 className="text-lg font-semibold">{issue.title}</h2>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {statusLabel[issue.status]}
            </Badge>
            <span className={`text-xs font-medium capitalize ${getPriorityColor(issue.priority)}`}>
              {issue.priority}
            </span>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{issue.assignee.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                {issue.repo.owner}/{issue.repo.name}
              </span>
            </div>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">{issue.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {issue.labels.map(l => (
              <Badge key={l} variant="secondary" className="text-xs">
                {l}
              </Badge>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">My Issues</h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => navigate('/issues')}
        >
          View all issues
        </Button>
      </div>

      {/* Grouped issue list */}
      <div className="space-y-6">
        {groups.map(({ status, issues }) => (
          <div key={status}>
            <div className="flex items-center gap-2 px-3 mb-1">
              {statusIcon(status)}
              <span className="text-[13px] font-medium text-muted-foreground">
                {statusLabel[status]}
              </span>
              <span className="text-[11px] text-muted-foreground/50">{issues.length}</span>
            </div>
            <div className="space-y-px">{issues.map(renderIssueRow)}</div>
          </div>
        ))}
      </div>

      {/* Recommended Projects — redesigned */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Recommended Projects</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground gap-1"
            onClick={() => navigate('/projects')}
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.slice(0, 6).map(project => {
              const meta = getProjectMeta(project.id);
              return (
                <ProjectCard
                  key={project.id}
                  name={project.name}
                  description={project.description}
                  language={project.technologies[0] || 'JavaScript'}
                  stars={meta.stars}
                  forks={meta.forks}
                  contributors={meta.contributors}
                  lastActive={meta.lastActive}
                  technologies={project.technologies}
                  status={project.status}
                  isPaid={project.is_paid}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>
              No projects to show.{' '}
              <button
                className="text-primary hover:underline"
                onClick={() => navigate('/projects')}
              >
                Explore projects
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
