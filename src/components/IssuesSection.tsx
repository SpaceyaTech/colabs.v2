import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Circle, Timer, CheckCircle2 } from 'lucide-react';
import { IssueSidePanel, type UnifiedIssue } from '@/components/issues/IssueSidePanel';
import { IssueRow } from '@/components/issues/IssueRow';

const mockIssues: UnifiedIssue[] = [
  {
    id: 'ISS-001',
    title: 'Implement user authentication flow',
    description: 'Create a comprehensive authentication system.',
    status: 'todo',
    priority: 'high',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'web-app', owner: 'company' },
    labels: ['backend', 'authentication', 'security'],
    createdAt: '2024-01-15',
    comments: 3,
    category: 'feature',
  },
  {
    id: 'ISS-002',
    title: 'Fix responsive layout on mobile devices',
    description: 'Header breaks on small screens.',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'ui-components', owner: 'design-system' },
    labels: ['frontend', 'responsive', 'bug'],
    createdAt: '2024-01-14',
    comments: 1,
    category: 'bug',
  },
  {
    id: 'ISS-003',
    title: 'Optimize database queries for better performance',
    description: 'Some queries are taking too long.',
    status: 'in-progress',
    priority: 'urgent',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'api-server', owner: 'backend-team' },
    labels: ['backend', 'performance'],
    createdAt: '2024-01-12',
    comments: 5,
    category: 'enhancement',
  },
  {
    id: 'ISS-004',
    title: 'Add payment integration tests',
    description: 'Write comprehensive tests.',
    status: 'in-progress',
    priority: 'high',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'payment-service', owner: 'fintech-team' },
    labels: ['testing', 'payment'],
    createdAt: '2024-01-13',
    comments: 2,
    category: 'feature',
  },
  {
    id: 'ISS-005',
    title: 'Setup CI/CD pipeline for production',
    description: 'Configure automated deployment.',
    status: 'done',
    priority: 'medium',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'infrastructure', owner: 'devops-team' },
    labels: ['devops', 'ci/cd'],
    createdAt: '2024-01-10',
    comments: 8,
    category: 'feature',
  },
  {
    id: 'ISS-006',
    title: 'Update documentation for API endpoints',
    description: 'Add comprehensive documentation.',
    status: 'done',
    priority: 'low',
    assignee: { name: 'You', avatar: '' },
    repo: { name: 'api-docs', owner: 'documentation-team' },
    labels: ['documentation', 'api'],
    createdAt: '2024-01-09',
    comments: 4,
    category: 'documentation',
  },
];

const statusIcon = (s: UnifiedIssue['status']) => {
  switch (s) {
    case 'in-progress':
      return <Timer className="h-3.5 w-3.5 text-yellow-400 shrink-0" />;
    case 'todo':
      return <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    case 'done':
      return <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />;
    default:
      return <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
};

const statusLabel: Record<string, string> = {
  'in-progress': 'In Progress',
  todo: 'Todo',
  done: 'Done',
};

export function IssuesSection() {
  const navigate = useNavigate();

  const groups = [
    { status: 'todo' as const, issues: mockIssues.filter((i) => i.status === 'todo') },
    {
      status: 'in-progress' as const,
      issues: mockIssues.filter((i) => i.status === 'in-progress'),
    },
    { status: 'done' as const, issues: mockIssues.filter((i) => i.status === 'done') },
  ].filter((g) => g.issues.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Issues</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => navigate('/issues')}
        >
          View all
        </Button>
      </div>

      <div className="space-y-4">
        {groups.map(({ status, issues }) => (
          <div key={status}>
            <div className="flex items-center gap-2 px-3 mb-1">
              {statusIcon(status)}
              <span className="text-[13px] font-medium text-muted-foreground">
                {statusLabel[status]}
              </span>
              <span className="text-[11px] text-muted-foreground/50">{issues.length}</span>
            </div>
            <div className="space-y-px">
              {issues.map((issue) => (
                <Sheet key={issue.id}>
                  <SheetTrigger asChild>
                    <IssueRow issue={issue} />
                  </SheetTrigger>
                  <SheetContent className="w-[85vw] sm:w-[500px]" side="right">
                    <SheetHeader>
                      <SheetTitle className="text-left font-mono text-sm text-muted-foreground">
                        {issue.id}
                      </SheetTitle>
                    </SheetHeader>
                    <IssueSidePanel issue={issue} />
                  </SheetContent>
                </Sheet>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
