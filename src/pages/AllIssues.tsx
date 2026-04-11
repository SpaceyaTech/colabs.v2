import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertCircle,
  Bookmark,
  Bug,
  Code,
  FileText,
  Filter,
  Github,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  ArrowUpDown,
  X,
  CircleDot,
  Plus,
  Check,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useGitHubIssues, GitHubIssue } from '@/hooks/useGitHubIssues';
import { useAuth } from '@/hooks/useAuth';
import { useGitHub } from '@/hooks/useGitHub';
import { IssueSidePanel, type UnifiedIssue } from '@/components/issues/IssueSidePanel';
import { useClaimedIssues } from '@/hooks/useClaimedIssues';

const mockIssues: UnifiedIssue[] = [
  {
    id: 'ISS-001',
    title: 'Implement user authentication flow',
    description:
      'Create a comprehensive authentication system with login, signup, and password reset functionality.',
    status: 'todo',
    priority: 'high',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'web-app', owner: 'company' },
    labels: ['backend', 'authentication', 'good first issue'],
    createdAt: '2024-01-15',
    comments: 3,
    isGoodFirstIssue: true,
    category: 'feature',
  },
  {
    id: 'ISS-002',
    title: 'Fix responsive layout on mobile devices',
    description: 'The header navigation breaks on screens smaller than 768px.',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'ui-components', owner: 'design-system' },
    labels: ['frontend', 'responsive', 'bug', 'good first issue'],
    createdAt: '2024-01-14',
    comments: 1,
    isGoodFirstIssue: true,
    category: 'bug',
  },
  {
    id: 'ISS-003',
    title: 'Optimize database queries for better performance',
    description: 'Some queries are taking too long to execute.',
    status: 'todo',
    priority: 'urgent',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'api-server', owner: 'backend-team' },
    labels: ['backend', 'performance', 'database'],
    createdAt: '2024-01-12',
    comments: 5,
    category: 'enhancement',
  },
  {
    id: 'ISS-004',
    title: 'Add payment integration tests',
    description: 'Write comprehensive tests for the payment flow.',
    status: 'todo',
    priority: 'high',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'payment-service', owner: 'fintech-team' },
    labels: ['testing', 'payment', 'backend'],
    createdAt: '2024-01-13',
    comments: 2,
    category: 'feature',
  },
  {
    id: 'ISS-005',
    title: 'Update API documentation',
    description: 'Add comprehensive documentation for all REST API endpoints with examples.',
    status: 'todo',
    priority: 'low',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'api-docs', owner: 'documentation-team' },
    labels: ['documentation', 'api', 'good first issue'],
    createdAt: '2024-01-09',
    comments: 4,
    isGoodFirstIssue: true,
    category: 'documentation',
  },
  {
    id: 'ISS-006',
    title: 'Add dark mode support',
    description: 'Implement dark mode toggle with proper theme persistence.',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'ui-components', owner: 'design-system' },
    labels: ['frontend', 'enhancement', 'help wanted'],
    createdAt: '2024-01-16',
    comments: 6,
    category: 'enhancement',
  },
  {
    id: 'ISS-007',
    title: 'Fix memory leak in websocket connection',
    description: 'WebSocket connections are not properly cleaned up.',
    status: 'todo',
    priority: 'urgent',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'realtime-server', owner: 'backend-team' },
    labels: ['bug', 'urgent', 'backend'],
    createdAt: '2024-01-17',
    comments: 8,
    category: 'bug',
  },
  {
    id: 'ISS-008',
    title: 'Create onboarding tutorial',
    description: 'Build an interactive onboarding experience for new users.',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'web-app', owner: 'company' },
    labels: ['frontend', 'ux', 'good first issue'],
    createdAt: '2024-01-18',
    comments: 2,
    isGoodFirstIssue: true,
    category: 'feature',
  },
  {
    id: 'ISS-009',
    title: 'Add unit tests for utility functions',
    description: 'Increase test coverage by adding unit tests.',
    status: 'todo',
    priority: 'low',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'shared-utils', owner: 'company' },
    labels: ['testing', 'good first issue'],
    createdAt: '2024-01-19',
    comments: 1,
    isGoodFirstIssue: true,
    category: 'enhancement',
  },
  {
    id: 'ISS-010',
    title: 'Improve error handling in API routes',
    description: 'Add consistent error handling and user-friendly messages.',
    status: 'todo',
    priority: 'high',
    assignee: { name: 'Unassigned', avatar: '' },
    repo: { name: 'api-server', owner: 'backend-team' },
    labels: ['backend', 'help wanted'],
    createdAt: '2024-01-20',
    comments: 3,
    category: 'enhancement',
  },
];

const priorityIcon = (p: UnifiedIssue['priority']) => {
  switch (p) {
    case 'urgent':
      return <span className="text-destructive text-xs">⚡</span>;
    case 'high':
      return <span className="text-orange-400 text-xs">▲</span>;
    case 'medium':
      return <span className="text-yellow-400 text-xs">■</span>;
    case 'low':
      return <span className="text-muted-foreground text-xs">▽</span>;
  }
};

type SortField = 'priority' | 'date' | 'title';
type SortDir = 'asc' | 'desc';
const PRIORITY_ORDER: Record<UnifiedIssue['priority'], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function FilterChip({
  label,
  active,
  onClick,
}: {
  readonly label: string;
  readonly active: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${active ? 'bg-primary/15 text-primary border-primary/30' : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground'}`}
    >
      {label}
    </button>
  );
}

function IssueListItem({
  issue,
  isClaimed,
  onClaim,
}: {
  readonly issue: UnifiedIssue;
  readonly isClaimed: boolean;
  readonly onClaim: (issue: UnifiedIssue) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/50 rounded-md group transition-colors border-b border-border/20 last:border-0">
          {priorityIcon(issue.priority)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] font-medium truncate group-hover:text-primary transition-colors">
                {issue.title}
              </span>
              {issue.isGoodFirstIssue && (
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 shrink-0"
                >
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  Good First
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/70">
                {issue.repo.owner}/{issue.repo.name}
              </span>
              <span>·</span>
              <div className="flex items-center gap-1">
                {issue.labels.slice(0, 3).map(l => (
                  <span key={l} className="px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                    {l}
                  </span>
                ))}
              </div>
              <span className="ml-auto shrink-0">
                {new Date(issue.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
          <Button
            variant={isClaimed ? 'secondary' : 'outline'}
            size="sm"
            className={`h-7 text-[11px] shrink-0 gap-1 ${isClaimed ? 'text-primary' : ''}`}
            onClick={e => {
              e.stopPropagation();
              if (!isClaimed) onClaim(issue);
            }}
            disabled={isClaimed}
          >
            {isClaimed ? (
              <>
                <Check className="h-3 w-3" />
                Claimed
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                Claim
              </>
            )}
          </Button>
        </button>
      </SheetTrigger>
      <SheetContent className="w-[85vw] sm:w-[500px]" side="right">
        <SheetHeader>
          <SheetTitle className="text-left font-mono text-sm text-muted-foreground">
            {issue.id}
          </SheetTitle>
        </SheetHeader>
        <IssueSidePanel
          issue={issue}
          showSave
          showClaim
          isClaimed={isClaimed}
          onClaim={() => onClaim(issue)}
        />
      </SheetContent>
    </Sheet>
  );
}

export default function AllIssues() {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIssueIds, setSavedIssueIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriorities, setFilterPriorities] = useState<Set<UnifiedIssue['priority']>>(
    new Set()
  );

  const { user } = useAuth();
  const { issues: githubIssues, loading, message, refetch, repositories } = useGitHubIssues();
  const { connectToGitHub, integration, checkIntegration, loading: githubLoading } = useGitHub();
  const { claimedIssueIds, claimIssue } = useClaimedIssues();

  useEffect(() => {
    if (user) checkIntegration();
  }, [user, checkIntegration]);

  useEffect(() => {
    const load = () => setSavedIssueIds(JSON.parse(localStorage.getItem('savedIssues') || '[]'));
    load();
    globalThis.addEventListener('storage', load);
    globalThis.addEventListener('savedIssuesUpdated', load);
    return () => {
      globalThis.removeEventListener('storage', load);
      globalThis.removeEventListener('savedIssuesUpdated', load);
    };
  }, []);

  const transformedIssues: UnifiedIssue[] = githubIssues.map((gi: GitHubIssue) => ({
    id: gi.id,
    title: gi.title,
    description: gi.description,
    status: gi.status,
    priority: gi.priority,
    assignee: gi.assignee,
    repo: { name: gi.repo.name, owner: gi.repo.owner, full_name: gi.repo.full_name },
    labels: gi.labels,
    createdAt: gi.createdAt,
    comments: gi.comments,
    isGoodFirstIssue: gi.isGoodFirstIssue,
    category: gi.category,
    html_url: gi.html_url,
  }));

  const allIssues = transformedIssues.length > 0 ? transformedIssues : mockIssues;

  const toggleSet = <T,>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    return next;
  };

  const activeFilterCount = filterPriorities.size;

  const getTabIssues = (tab: string) => {
    switch (tab) {
      case 'saved':
        return allIssues.filter(i => savedIssueIds.includes(i.id));
      case 'bugs':
        return allIssues.filter(i => i.category === 'bug');
      case 'features':
        return allIssues.filter(i => i.category === 'feature');
      case 'enhancements':
        return allIssues.filter(i => i.category === 'enhancement');
      case 'docs':
        return allIssues.filter(i => i.category === 'documentation');
      case 'good-first':
        return allIssues.filter(i => i.isGoodFirstIssue);
      default:
        return allIssues;
    }
  };

  const filteredAndSorted = useMemo(() => {
    let issues = getTabIssues(activeTab);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      issues = issues.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.labels.some(l => l.toLowerCase().includes(q)) ||
          i.id.toLowerCase().includes(q) ||
          `${i.repo.owner}/${i.repo.name}`.toLowerCase().includes(q)
      );
    }
    if (filterPriorities.size > 0) issues = issues.filter(i => filterPriorities.has(i.priority));

    issues.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'priority':
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case 'date':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return issues;
  }, [activeTab, allIssues, searchQuery, filterPriorities, sortField, sortDir, savedIssueIds]);

  const clearAllFilters = () => {
    setFilterPriorities(new Set());
    setSearchQuery('');
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Explore Issues</h1>
            <p className="text-[13px] text-muted-foreground">
              {transformedIssues.length > 0
                ? `${transformedIssues.length} open issues across ${repositories.length} projects`
                : 'Browse open issues from OSS projects on the platform'}
            </p>
          </div>
          {user && integration && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={refetch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Refresh
            </Button>
          )}
        </div>

        {/* GitHub Connection Banner */}
        {user && !integration && (
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Github className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Connect GitHub to see real issues</h3>
                <p className="text-[12px] text-muted-foreground">
                  Link your GitHub account to fetch issues from your repositories.
                </p>
              </div>
            </div>
            <Button
              onClick={connectToGitHub}
              disabled={githubLoading}
              size="sm"
              className="shrink-0"
            >
              {githubLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Github className="h-3.5 w-3.5 mr-1.5" />
              )}
              Connect
            </Button>
          </div>
        )}

        {message && !loading && (
          <div className="bg-muted/50 border border-border/40 rounded-lg p-3">
            <p className="text-[13px] text-muted-foreground">{message}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-3 text-sm text-muted-foreground">
              Loading issues from GitHub...
            </span>
          </div>
        )}

        {/* Category tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-8 bg-transparent p-0 gap-0.5 overflow-x-auto">
            {[
              { value: 'all', label: 'All', icon: AlertCircle, count: allIssues.length },
              {
                value: 'good-first',
                label: 'Good First',
                icon: Sparkles,
                count: allIssues.filter(i => i.isGoodFirstIssue).length,
              },
              {
                value: 'bugs',
                label: 'Bugs',
                icon: Bug,
                count: allIssues.filter(i => i.category === 'bug').length,
              },
              {
                value: 'features',
                label: 'Features',
                icon: Zap,
                count: allIssues.filter(i => i.category === 'feature').length,
              },
              {
                value: 'enhancements',
                label: 'Enhancements',
                icon: Code,
                count: allIssues.filter(i => i.category === 'enhancement').length,
              },
              {
                value: 'docs',
                label: 'Docs',
                icon: FileText,
                count: allIssues.filter(i => i.category === 'documentation').length,
              },
              {
                value: 'saved',
                label: 'Saved',
                icon: Bookmark,
                count: allIssues.filter(i => savedIssueIds.includes(i.id)).length,
              },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[12px] px-2.5 py-1 h-7 gap-1.5 data-[state=active]:bg-accent data-[state=active]:shadow-none rounded-md"
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
                <span className="text-[10px] text-muted-foreground">{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0 sm:min-w-[180px] sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by title, label, or project..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-[13px] bg-transparent border-border/40"
            />
          </div>
          <Button
            variant={showFilters ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Sort by
                </p>
                {(
                  [
                    ['date', 'Newest first'],
                    ['priority', 'Priority'],
                    ['title', 'Title'],
                  ] as [SortField, string][]
                ).map(([field, label]) => (
                  <button
                    key={field}
                    onClick={() => {
                      if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
                      else {
                        setSortField(field);
                        setSortDir(field === 'date' ? 'desc' : 'asc');
                      }
                    }}
                    className={`w-full text-left text-[13px] px-2 py-1.5 rounded-md transition-colors flex items-center justify-between ${sortField === field ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
                  >
                    {label}
                    {sortField === field && (
                      <span className="text-[10px] text-muted-foreground">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {(activeFilterCount > 0 || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-muted-foreground"
              onClick={clearAllFilters}
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 p-3 rounded-lg border border-border/40 bg-card/50">
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Priority</p>
              <div className="flex flex-wrap gap-1.5">
                {(['urgent', 'high', 'medium', 'low'] as const).map(p => (
                  <FilterChip
                    key={p}
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                    active={filterPriorities.has(p)}
                    onClick={() => setFilterPriorities(toggleSet(filterPriorities, p))}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {(activeFilterCount > 0 || searchQuery) && (
          <p className="text-[11px] text-muted-foreground px-1">
            {filteredAndSorted.length} issue{filteredAndSorted.length === 1 ? '' : 's'} found
          </p>
        )}

        {/* Issue list */}
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            <CircleDot className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p>No issues found</p>
            {(activeFilterCount > 0 || searchQuery) && (
              <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={clearAllFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {filteredAndSorted.map(issue => (
              <IssueListItem
                key={issue.id}
                issue={issue}
                isClaimed={claimedIssueIds.has(issue.id)}
                onClaim={claimIssue}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
