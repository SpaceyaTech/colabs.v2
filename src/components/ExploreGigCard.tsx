import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Clock,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Send,
  Building2,
  MessageSquare,
  Star,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ExploreGig {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyVerified?: boolean;
  companyRating?: number;
  companyReviewCount?: number;
  budget: string;
  budgetValue: number;
  duration: string;
  postedAt: string;
  technologies: string[];
  description: string;
  location: string;
  proposals: number;
  difficulty: 'Entry level' | 'Intermediate' | 'Expert';
  category?: string;
  isUrgent?: boolean;
  featured?: boolean;
}

const difficultyColor: Record<string, string> = {
  'Entry level': 'bg-primary/15 text-primary border-primary/20',
  Intermediate: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
  Expert: 'bg-destructive/15 text-destructive border-destructive/20',
};

interface ExploreGigCardProps {
  gig: ExploreGig;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  showApply?: boolean;
}

export function ExploreGigCard({
  gig,
  isSaved = false,
  onToggleSave,
  showApply = true,
}: ExploreGigCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="border-border/40 hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => navigate(`/gig/${gig.id}`)}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {gig.featured && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium bg-primary/15 text-primary border-primary/20 flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5" /> Featured
            </span>
          )}
          {gig.isUrgent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium bg-destructive/15 text-destructive border-destructive/20 flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5" /> Urgent
            </span>
          )}
        </div>

        {/* Title + Company */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {gig.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-[10px] text-muted-foreground truncate">{gig.company}</p>
              {gig.companyVerified && (
                <span className="text-[9px] px-1 py-0 rounded border border-primary/20 text-primary">
                  ✓
                </span>
              )}
              {gig.companyRating && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Star className="h-2.5 w-2.5 fill-current text-yellow-500" />
                  {gig.companyRating}
                </span>
              )}
            </div>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${difficultyColor[gig.difficulty] || ''}`}
          >
            {gig.difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
          {gig.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <DollarSign className="h-3 w-3" />
            {gig.budget}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {gig.duration}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {gig.location}
          </span>
        </div>

        {/* Tech tags */}
        <div className="flex items-center gap-1 flex-wrap">
          {gig.technologies.slice(0, 3).map(t => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground"
            >
              {t}
            </span>
          ))}
          {gig.technologies.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
              +{gig.technologies.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{gig.postedAt}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-2.5 w-2.5" /> {gig.proposals} proposals
            </span>
          </div>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {onToggleSave && (
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${isSaved ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => onToggleSave(gig.id)}
              >
                {isSaved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
              </Button>
            )}
            {showApply && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2 gap-1"
                onClick={() => navigate(`/submit-proposal/${gig.id}`)}
              >
                <Send className="h-2.5 w-2.5" /> Apply
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
