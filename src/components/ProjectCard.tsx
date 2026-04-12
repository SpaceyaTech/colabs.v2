import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, GitFork, Users, Activity, ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  description: string;
  owner?: string;
  language: string;
  languageColor?: string;
  stars: number;
  forks: number;
  contributors?: number;
  lastActive?: string;
  technologies?: string[];
  status?: string;
  isPaid?: boolean;
  role?: 'owner' | 'contributor' | 'maintainer';
  githubUrl?: string;
  onClick?: () => void;
}

const getLanguageColor = (lang: string) => {
  const colors: Record<string, string> = {
    TypeScript: 'bg-blue-500',
    JavaScript: 'bg-yellow-500',
    Python: 'bg-green-500',
    'Vue.js': 'bg-emerald-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-orange-500',
    React: 'bg-blue-400',
  };
  return colors[lang] || 'bg-muted-foreground';
};

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'owner':
      return 'default' as const;
    case 'maintainer':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
};

export function ProjectCard({
  name,
  description,
  owner,
  language,
  languageColor,
  stars,
  forks,
  contributors,
  lastActive,
  technologies,
  status,
  isPaid,
  role,
  githubUrl,
  onClick,
}: ProjectCardProps) {
  const resolvedLangColor = languageColor || getLanguageColor(language);

  return (
    <Card
      className="border-[0.5px] border-border/40 hover:border-primary/40 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2.5">
        {/* Header: name + role/status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {githubUrl ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary hover:underline truncate flex items-center gap-1"
                  onClick={e => e.stopPropagation()}
                >
                  {owner ? `${owner}/` : ''}
                  {name}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {owner ? (
                    <span className="text-muted-foreground font-normal">{owner}/</span>
                  ) : null}
                  {name}
                </h3>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {role && (
              <Badge variant={getRoleBadgeVariant(role)} className="capitalize text-[10px]">
                {role}
              </Badge>
            )}
            {status && (
              <Badge
                variant={status === 'active' ? 'default' : 'secondary'}
                className="text-[10px]"
              >
                {status}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>

        {/* Tech/topic tags */}
        {technologies && technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {technologies.slice(0, 4).map(tech => (
              <Badge key={tech} variant="secondary" className="text-[10px]">
                {tech}
              </Badge>
            ))}
            {technologies.length > 4 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{technologies.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 pt-1.5 border-t border-border/30 text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${resolvedLangColor}`} />
            <span className="text-[11px] hidden sm:inline">{language}</span>
          </div>
          <div className="flex items-center gap-1" title="Stars">
            <Star className="h-3 w-3" />
            <span className="text-[11px]">{formatNumber(stars)}</span>
          </div>
          <div className="flex items-center gap-1" title="Forks">
            <GitFork className="h-3 w-3" />
            <span className="text-[11px]">{formatNumber(forks)}</span>
          </div>
          {contributors !== undefined && (
            <div className="flex items-center gap-1" title="Contributors">
              <Users className="h-3 w-3" />
              <span className="text-[11px]">{contributors}</span>
            </div>
          )}
          {lastActive && (
            <div className="flex items-center gap-1 ml-auto" title="Last activity">
              <Activity className="h-3 w-3" />
              <span className="text-[10px]">{lastActive}</span>
            </div>
          )}
          {isPaid && (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 ml-auto border-primary/30 text-primary"
            >
              Paid
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
