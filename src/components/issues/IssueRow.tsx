import { forwardRef } from 'react';
import { Circle, Timer, CheckCircle2, CircleDot } from 'lucide-react';
import type { UnifiedIssue } from './IssueSidePanel';

const priorityIcon = (p: UnifiedIssue['priority']) => {
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

const statusIcon = (s: UnifiedIssue['status']) => {
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

export const IssueRow = forwardRef<
  HTMLButtonElement,
  { issue: UnifiedIssue; onClick?: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ issue, onClick, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className="w-full flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2.5 sm:py-2 text-left hover:bg-accent/50 transition-colors rounded-md group text-[13px]"
    {...props}
  >
    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
      {priorityIcon(issue.priority)}
      <span className="text-muted-foreground font-mono text-xs shrink-0">{issue.id}</span>
      {statusIcon(issue.status)}
      <span className="flex-1 truncate text-foreground group-hover:text-primary transition-colors">
        {issue.title}
      </span>
    </div>
    <div className="flex items-center gap-1.5 pl-5 sm:pl-0">
      {issue.labels.slice(0, 2).map((l) => (
        <span key={l} className="text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
          {l}
        </span>
      ))}
      <span className="text-xs text-muted-foreground/60 shrink-0 ml-auto sm:ml-0">
        {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>
  </button>
));

IssueRow.displayName = 'IssueRow';
