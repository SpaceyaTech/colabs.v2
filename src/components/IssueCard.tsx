import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IssueCardProps {
  id: string;
  title: string;
  labels: string[];
  assignee: { name: string; avatar?: string };
  createdAt?: string;
  comments?: number;
  onClick?: () => void;
}

function formatDateTime(dateString?: string) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const day = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return `${time}, ${day}`;
}

function getLabelStyles(label: string) {
  const l = label.toLowerCase();
  if (l.includes('bug')) return 'bg-destructive/15 text-destructive border border-destructive/20';
  if (l.includes('feature') || l.includes('enhancement'))
    return 'bg-primary/10 text-primary border border-primary/20';
  return 'bg-muted/50 text-muted-foreground border border-border';
}

export function IssueCard({ id, title, labels, assignee, createdAt, onClick }: IssueCardProps) {
  return (
    <Card
      onClick={onClick}
      className="h-[121px] w-full cursor-pointer rounded-xl border border-border bg-card/95 p-3 shadow-sm transition-all hover:shadow-md"
      aria-label={`Open issue ${id}`}
    >
      <div className="flex h-full flex-col">
        {/* Top: date */}
        <div className="flex items-center justify-end mb-2">
          <span className="text-[10px] text-muted-foreground">{formatDateTime(createdAt)}</span>
        </div>

        {/* Title with issue number */}
        <h4 className="line-clamp-2 text-sm font-medium text-foreground mb-2">
          #{id}: {title}
        </h4>

        {/* Bottom: labels */}
        <div className="mt-auto flex items-center gap-1.5 flex-wrap">
          {labels.slice(0, 3).map((label) => (
            <Badge
              key={label}
              variant="outline"
              className={`h-[22px] px-2 text-[10px] ${getLabelStyles(label)}`}
            >
              <span className="truncate">{label}</span>
            </Badge>
          ))}
          {labels.length > 3 && (
            <Badge
              variant="outline"
              className="h-[22px] px-2 text-[10px] bg-muted/50 text-muted-foreground border border-border"
            >
              +{labels.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

export default IssueCard;
