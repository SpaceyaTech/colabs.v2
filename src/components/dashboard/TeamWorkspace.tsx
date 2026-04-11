import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Circle,
  GitCommit,
  GitPullRequest,
  MessageSquare,
  Figma,
  Github,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Flag,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// --- Mock Data ---

const teamMembers = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Engineering Lead',
    avatar: '',
    initials: 'SC',
    status: 'online',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Frontend Engineer',
    avatar: '',
    initials: 'MJ',
    status: 'online',
  },
  {
    id: '3',
    name: 'Aisha Patel',
    role: 'Backend Engineer',
    avatar: '',
    initials: 'AP',
    status: 'away',
  },
  { id: '4', name: 'Tom Rivera', role: 'Designer', avatar: '', initials: 'TR', status: 'online' },
  {
    id: '5',
    name: 'Lisa Wang',
    role: 'Product Manager',
    avatar: '',
    initials: 'LW',
    status: 'offline',
  },
  { id: '6', name: 'Dev Intern', role: 'Intern', avatar: '', initials: 'DI', status: 'online' },
];

interface Task {
  id: string;
  title: string;
  status: 'in-progress' | 'todo' | 'in-review' | 'done' | 'blocked';
  progress: number;
  assignees: string[];
  estimatedCompletion: string;
  timeAllocated: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  blockers: string[];
  source: 'github' | 'figma' | 'slack';
  sourceRef: string;
}

const tasks: Task[] = [
  {
    id: 'TEAM-101',
    title: 'User authentication flow redesign',
    status: 'in-progress',
    progress: 65,
    assignees: ['1', '2', '4'],
    estimatedCompletion: 'Mar 5',
    timeAllocated: '32h / 48h',
    priority: 'high',
    blockers: [],
    source: 'github',
    sourceRef: '#142',
  },
  {
    id: 'TEAM-102',
    title: 'Payment gateway integration',
    status: 'blocked',
    progress: 30,
    assignees: ['3'],
    estimatedCompletion: 'Mar 10',
    timeAllocated: '12h / 40h',
    priority: 'urgent',
    blockers: [
      'Waiting on Stripe API credentials from finance team',
      'Sandbox environment not provisioned',
    ],
    source: 'github',
    sourceRef: '#158',
  },
  {
    id: 'TEAM-103',
    title: 'Dashboard analytics wireframes',
    status: 'in-review',
    progress: 90,
    assignees: ['4', '5'],
    estimatedCompletion: 'Mar 2',
    timeAllocated: '18h / 20h',
    priority: 'medium',
    blockers: [],
    source: 'figma',
    sourceRef: 'Dashboard v2',
  },
  {
    id: 'TEAM-104',
    title: 'API rate limiter middleware',
    status: 'in-progress',
    progress: 45,
    assignees: ['3', '6'],
    estimatedCompletion: 'Mar 7',
    timeAllocated: '8h / 16h',
    priority: 'medium',
    blockers: [],
    source: 'github',
    sourceRef: '#163',
  },
  {
    id: 'TEAM-105',
    title: 'Onboarding email sequence',
    status: 'todo',
    progress: 0,
    assignees: ['5'],
    estimatedCompletion: 'Mar 12',
    timeAllocated: '0h / 8h',
    priority: 'low',
    blockers: [],
    source: 'slack',
    sourceRef: '#product',
  },
  {
    id: 'TEAM-106',
    title: 'Mobile responsive fixes',
    status: 'done',
    progress: 100,
    assignees: ['2'],
    estimatedCompletion: 'Feb 28',
    timeAllocated: '6h / 6h',
    priority: 'medium',
    blockers: [],
    source: 'github',
    sourceRef: '#155',
  },
];

const activityFeed = [
  {
    id: '1',
    member: 'Sarah Chen',
    initials: 'SC',
    action: 'merged PR #142',
    detail: 'auth-flow-redesign → main',
    time: '2h ago',
    type: 'pr' as const,
  },
  {
    id: '2',
    member: 'Marcus Johnson',
    initials: 'MJ',
    action: 'pushed 3 commits',
    detail: 'to feature/auth-ui',
    time: '3h ago',
    type: 'commit' as const,
  },
  {
    id: '3',
    member: 'Tom Rivera',
    initials: 'TR',
    action: 'updated designs',
    detail: 'Dashboard Analytics v2 on Figma',
    time: '4h ago',
    type: 'figma' as const,
  },
  {
    id: '4',
    member: 'Aisha Patel',
    initials: 'AP',
    action: 'commented on',
    detail: 'TEAM-102: Need Stripe sandbox access',
    time: '5h ago',
    type: 'comment' as const,
  },
  {
    id: '5',
    member: 'Lisa Wang',
    initials: 'LW',
    action: 'flagged blocker',
    detail: 'Payment gateway blocked on credentials',
    time: '6h ago',
    type: 'flag' as const,
  },
  {
    id: '6',
    member: 'Dev Intern',
    initials: 'DI',
    action: 'pushed 1 commit',
    detail: 'to feature/rate-limiter',
    time: '7h ago',
    type: 'commit' as const,
  },
];

const memberStats = [
  { id: '1', name: 'Sarah Chen', commits: 12, prs: 3, hours: 8.5 },
  { id: '2', name: 'Marcus Johnson', commits: 8, prs: 2, hours: 7.0 },
  { id: '3', name: 'Aisha Patel', commits: 5, prs: 1, hours: 6.0 },
  { id: '4', name: 'Tom Rivera', commits: 0, prs: 0, hours: 5.5 },
  { id: '5', name: 'Lisa Wang', commits: 0, prs: 0, hours: 4.0 },
  { id: '6', name: 'Dev Intern', commits: 3, prs: 0, hours: 3.5 },
];

// --- Helpers ---

const statusConfig = {
  'in-progress': { label: 'In Progress', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  todo: { label: 'Todo', color: 'bg-muted-foreground', textColor: 'text-muted-foreground' },
  'in-review': { label: 'In Review', color: 'bg-blue-500', textColor: 'text-blue-600' },
  done: { label: 'Done', color: 'bg-green-500', textColor: 'text-green-600' },
  blocked: { label: 'Blocked', color: 'bg-destructive', textColor: 'text-destructive' },
};

const priorityConfig = {
  urgent: { icon: '🔴', label: 'Urgent' },
  high: { icon: '🟠', label: 'High' },
  medium: { icon: '🟡', label: 'Medium' },
  low: { icon: '🔵', label: 'Low' },
};

const sourceIcon = {
  github: Github,
  figma: Figma,
  slack: MessageSquare,
};

function getMember(id: string) {
  return teamMembers.find(m => m.id === id);
}

// --- Components ---

function TaskRow({ task }: { task: Task }) {
  const [open, setOpen] = useState(task.blockers.length > 0);
  const SourceIcon = sourceIcon[task.source];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`border-b border-border last:border-0 ${task.status === 'blocked' ? 'bg-destructive/5' : ''}`}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full text-left px-3 sm:px-4 py-3 hover:bg-muted/50 transition-colors">
            {/* Desktop row */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-4 shrink-0">
                {open ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusConfig[task.status].color}`}
              />
              <span className="text-xs text-muted-foreground font-mono shrink-0">{task.id}</span>
              <span className="text-sm font-medium truncate flex-1">{task.title}</span>
              {task.blockers.length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {task.blockers.length} blocker{task.blockers.length > 1 ? 's' : ''}
                </Badge>
              )}
              <span className="text-xs shrink-0" title={priorityConfig[task.priority].label}>
                {priorityConfig[task.priority].icon}
              </span>
              <div className="w-20 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Progress value={task.progress} className="h-1.5" />
                  <span className="text-[10px] text-muted-foreground w-7 text-right">
                    {task.progress}%
                  </span>
                </div>
              </div>
              <div className="flex -space-x-1.5 shrink-0">
                {task.assignees.slice(0, 3).map(id => {
                  const m = getMember(id);
                  return m ? (
                    <Avatar key={id} className="h-5 w-5 border border-background">
                      <AvatarFallback className="text-[8px] bg-muted">{m.initials}</AvatarFallback>
                    </Avatar>
                  ) : null;
                })}
                {task.assignees.length > 3 && (
                  <span className="text-[10px] text-muted-foreground ml-1">
                    +{task.assignees.length - 3}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0 w-14 text-right">
                {task.estimatedCompletion}
              </span>
            </div>

            {/* Mobile card layout */}
            <div className="flex sm:hidden flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-4 shrink-0">
                  {open ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${statusConfig[task.status].color}`}
                />
                <span className="text-xs text-muted-foreground font-mono">{task.id}</span>
                <span className="text-xs shrink-0">{priorityConfig[task.priority].icon}</span>
                {task.blockers.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0 h-5 shrink-0 ml-auto"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {task.blockers.length}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium pl-6">{task.title}</p>
              <div className="flex items-center gap-3 pl-6">
                <div className="flex-1 flex items-center gap-1.5">
                  <Progress value={task.progress} className="h-1.5" />
                  <span className="text-[10px] text-muted-foreground w-7 text-right">
                    {task.progress}%
                  </span>
                </div>
                <div className="flex -space-x-1.5 shrink-0">
                  {task.assignees.slice(0, 3).map(id => {
                    const m = getMember(id);
                    return m ? (
                      <Avatar key={id} className="h-5 w-5 border border-background">
                        <AvatarFallback className="text-[8px] bg-muted">
                          {m.initials}
                        </AvatarFallback>
                      </Avatar>
                    ) : null;
                  })}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {task.estimatedCompletion}
                </span>
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-3 pl-11 space-y-2">
            {/* Details row */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {task.timeAllocated}
              </span>
              <span className="flex items-center gap-1">
                <SourceIcon className="h-3 w-3" /> {task.sourceRef}
              </span>
              <Badge variant="outline" className="text-[10px] h-5">
                {statusConfig[task.status].label}
              </Badge>
            </div>

            {/* Assignee names */}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">People:</span>{' '}
              {task.assignees
                .map(id => getMember(id)?.name)
                .filter(Boolean)
                .join(', ')}
              {' · '}
              {task.assignees
                .map(id => getMember(id)?.role)
                .filter(Boolean)
                .join(', ')}
            </div>

            {/* Blockers */}
            {task.blockers.length > 0 && (
              <div className="space-y-1">
                {task.blockers.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function TeamWorkspace() {
  const navigate = useNavigate();

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  const overallProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => navigate('/dashboard/teams')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Acme Product Team</h1>
          <p className="text-xs text-muted-foreground">
            {teamMembers.length} members · 3 projects · Sprint 14
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">{activeTasks.length} active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground">{blockedTasks.length} blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{completedTasks.length} done</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Overall {overallProgress}%</span>
        </div>
      </div>

      {/* Main content: 2 columns on large screens */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: Tasks */}
        <div className="space-y-4 min-w-0">
          {/* Risks / Blockers callout */}
          {blockedTasks.length > 0 && (
            <div className="border border-destructive/30 rounded-lg bg-destructive/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Risks & Blockers</span>
              </div>
              {blockedTasks.map(t => (
                <div key={t.id} className="text-xs text-muted-foreground mb-1 last:mb-0">
                  <span className="font-medium text-foreground">{t.id}</span> {t.title}
                  {t.blockers.map((b, i) => (
                    <span key={i} className="block ml-4 text-destructive">
                      — {b}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Active tasks */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Active Tasks
            </h2>
            <div className="border border-border rounded-lg overflow-hidden">
              {activeTasks.map(t => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          </div>

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Completed
              </h2>
              <div className="border border-border rounded-lg overflow-hidden">
                {completedTasks.map(t => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Team members */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Team
            </h3>
            <div className="space-y-1">
              {teamMembers.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50"
                >
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-muted">{m.initials}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${
                        m.status === 'online'
                          ? 'bg-green-500'
                          : m.status === 'away'
                            ? 'bg-yellow-500'
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Contribution this week */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              This Week
            </h3>
            <div className="space-y-2">
              {memberStats.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1">
                  <span className="truncate flex-1">{s.name}</span>
                  <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1" title="Commits">
                      <GitCommit className="h-3 w-3" /> {s.commits}
                    </span>
                    <span className="flex items-center gap-1" title="PRs">
                      <GitPullRequest className="h-3 w-3" /> {s.prs}
                    </span>
                    <span className="flex items-center gap-1" title="Hours">
                      <Clock className="h-3 w-3" /> {s.hours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Activity feed */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {activityFeed.map(a => (
                <div key={a.id} className="flex items-start gap-2">
                  <Avatar className="h-5 w-5 mt-0.5 shrink-0">
                    <AvatarFallback className="text-[8px] bg-muted">{a.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs">
                      <span className="font-medium">{a.member.split(' ')[0]}</span>{' '}
                      <span className="text-muted-foreground">{a.action}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{a.detail}</p>
                    <p className="text-[10px] text-muted-foreground/60">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
