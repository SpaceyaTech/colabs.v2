import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Check,
  ExternalLink,
  MessageSquare,
  Plus,
  Sparkles,
  User,
  Circle,
  Timer,
  CheckCircle2,
  CircleDot,
  X,
} from 'lucide-react';

export interface UnifiedIssue {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: { name: string; avatar: string };
  repo: { name: string; owner: string; full_name?: string };
  labels: string[];
  createdAt: string;
  comments: number;
  isGoodFirstIssue?: boolean;
  category?: 'bug' | 'feature' | 'documentation' | 'enhancement' | 'help-wanted';
  html_url?: string;
  linearUrl?: string;
  figmaUrl?: string;
}

const statusLabel: Record<UnifiedIssue['status'], string> = {
  'in-progress': 'In Progress',
  todo: 'Todo',
  'in-review': 'In Review',
  done: 'Done',
};

const getStatusColor = (s: UnifiedIssue['status']) => {
  switch (s) {
    case 'todo':
      return 'bg-muted text-muted-foreground';
    case 'in-progress':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'in-review':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'done':
      return 'bg-primary/10 text-primary';
  }
};

const getPriorityColor = (p: UnifiedIssue['priority']) => {
  switch (p) {
    case 'urgent':
      return 'text-destructive';
    case 'high':
      return 'text-orange-500 dark:text-orange-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'low':
      return 'text-muted-foreground';
  }
};

export function IssueSidePanel({
  issue,
  showSave = false,
  showClaim = false,
  isClaimed = false,
  onClaim,
  showUnclaim = false,
  onUnclaim,
}: {
  issue: UnifiedIssue;
  showSave?: boolean;
  showClaim?: boolean;
  isClaimed?: boolean;
  onClaim?: () => void;
  showUnclaim?: boolean;
  onUnclaim?: () => void;
}) {
  // Lazy initializer — read localStorage synchronously at mount instead of
  // in a useEffect, avoiding react-hooks/set-state-in-effect
  const [isSaved, setIsSaved] = useState(() => {
    if (!showSave) return false;
    try {
      const savedIssues = JSON.parse(localStorage.getItem('savedIssues') || '[]');
      return savedIssues.includes(issue.id);
    } catch {
      return false;
    }
  });

  const toggleSave = () => {
    const savedIssues = JSON.parse(localStorage.getItem('savedIssues') || '[]');
    const updated = isSaved
      ? savedIssues.filter((id: string) => id !== issue.id)
      : [...savedIssues, issue.id];
    localStorage.setItem('savedIssues', JSON.stringify(updated));
    setIsSaved(!isSaved);
    window.dispatchEvent(new Event('savedIssuesUpdated'));
  };

  return (
    <div className="mt-4 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {/* Title block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">{issue.id}</span>
              {issue.isGoodFirstIssue && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Good First Issue
                </Badge>
              )}
            </div>
            {showSave && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSave}
                className={isSaved ? 'text-primary' : 'text-muted-foreground'}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </Button>
            )}
          </div>
          <h2 className="text-lg font-semibold">{issue.title}</h2>
        </div>

        {/* Status & priority */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-xs ${getStatusColor(issue.status)}`}>
            {statusLabel[issue.status]}
          </Badge>
          <span className={`text-xs font-medium capitalize ${getPriorityColor(issue.priority)}`}>
            {issue.priority}
          </span>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            {issue.assignee.avatar ? (
              <div className="flex items-center gap-1.5">
                <img
                  src={issue.assignee.avatar}
                  alt={issue.assignee.name}
                  className="w-4 h-4 rounded-full"
                />
                <span>{issue.assignee.name}</span>
              </div>
            ) : (
              <span>{issue.assignee.name || 'Unassigned'}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>
              {issue.repo.owner}/{issue.repo.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{issue.comments} comments</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Description</h3>
          <p className="text-sm text-muted-foreground">{issue.description}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Labels</h3>
          <div className="flex flex-wrap gap-1.5">
            {issue.labels.map((l) => (
              <Badge key={l} variant="secondary" className="text-xs">
                {l}
              </Badge>
            ))}
          </div>
        </div>

        {(issue.linearUrl || issue.figmaUrl) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">External Links</h3>
              <div className="space-y-1.5">
                {issue.linearUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => window.open(issue.linearUrl, '_blank')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    View in Linear
                  </Button>
                )}
                {issue.figmaUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => window.open(issue.figmaUrl, '_blank')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    View in Figma
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t mt-4 space-y-2">
        {showClaim && (
          <Button
            className="w-full"
            variant={isClaimed ? 'secondary' : 'default'}
            onClick={onClaim}
            disabled={isClaimed}
          >
            {isClaimed ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Already Claimed
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Claim This Issue
              </>
            )}
          </Button>
        )}
        {showUnclaim && onUnclaim && (
          <Button variant="destructive" className="w-full" size="sm" onClick={onUnclaim}>
            <X className="w-4 h-4 mr-2" />
            Unclaim Issue
          </Button>
        )}
        <Button
          variant={showClaim || showUnclaim ? 'outline' : 'default'}
          className="w-full"
          onClick={() => {
            const url =
              issue.html_url || `https://github.com/${issue.repo.owner}/${issue.repo.name}/issues`;
            window.open(url, '_blank');
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on GitHub
        </Button>
      </div>
    </div>
  );
}
