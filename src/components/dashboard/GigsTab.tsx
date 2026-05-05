import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DollarSign,
  Clock,
  Calendar,
  Briefcase,
  Search,
  Filter,
  ArrowUpDown,
  X,
  List,
  LayoutGrid,
  Sparkles,
  ExternalLink,
  Timer,
  CheckCircle2,
  XCircle,
  Send,
  MessageSquare,
  Building2,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { ExploreGigCard, type ExploreGig } from '@/components/ExploreGigCard';
import { useGigs, gigRowToExploreGig } from '@/hooks/useGigs';

// ---------- Types ----------
interface Gig {
  id: string;
  title: string;
  company: string;
  budget: string;
  budgetValue: number;
  duration: string;
  postedAt: string;
  status: 'applied' | 'interviewing' | 'accepted' | 'rejected';
  technologies: string[];
  description: string;
  location: string;
  proposals: number;
  difficulty: 'Entry level' | 'Intermediate' | 'Expert';
}

// ---------- Mock Data ----------
const mockGigs: Gig[] = [
  {
    id: 'GIG-001',
    title: 'React Component Library Development',
    company: 'TechStartup Inc.',
    budget: '$2,000 - $3,500',
    budgetValue: 2750,
    duration: '2-3 weeks',
    postedAt: '2024-01-10',
    status: 'interviewing',
    technologies: ['React', 'TypeScript', 'Storybook'],
    description:
      'Build a comprehensive React component library with TypeScript support and Storybook documentation.',
    location: 'Remote',
    proposals: 12,
    difficulty: 'Intermediate',
  },
  {
    id: 'GIG-002',
    title: 'API Integration & Documentation',
    company: 'DataFlow Systems',
    budget: '$1,500 - $2,500',
    budgetValue: 2000,
    duration: '1-2 weeks',
    postedAt: '2024-01-12',
    status: 'applied',
    technologies: ['Node.js', 'OpenAPI', 'REST'],
    description:
      'Integrate third-party APIs and create comprehensive documentation for the engineering team.',
    location: 'Remote',
    proposals: 8,
    difficulty: 'Entry level',
  },
  {
    id: 'GIG-003',
    title: 'Database Optimization Consulting',
    company: 'ScaleUp Corp',
    budget: '$3,000 - $5,000',
    budgetValue: 4000,
    duration: '3-4 weeks',
    postedAt: '2024-01-08',
    status: 'accepted',
    technologies: ['PostgreSQL', 'Redis', 'AWS'],
    description:
      'Optimize database queries, implement caching strategies, and improve overall system performance.',
    location: 'Hybrid - NYC',
    proposals: 5,
    difficulty: 'Expert',
  },
  {
    id: 'GIG-004',
    title: 'Mobile App UI/UX Implementation',
    company: 'MobileFirst Labs',
    budget: '$4,000 - $6,000',
    budgetValue: 5000,
    duration: '4-5 weeks',
    postedAt: '2024-01-05',
    status: 'rejected',
    technologies: ['React Native', 'Figma', 'TypeScript'],
    description:
      'Implement pixel-perfect UI/UX designs from Figma mockups into a React Native mobile application.',
    location: 'Remote',
    proposals: 15,
    difficulty: 'Intermediate',
  },
];

// Recommended gigs now fetched from Supabase via useGigs hook

// ---------- Constants & Helpers ----------
const ALL_STATUSES = ['applied', 'interviewing', 'accepted', 'rejected'] as const;
const ALL_DIFFICULTIES = ['Entry level', 'Intermediate', 'Expert'] as const;
type SortField = 'budget' | 'date' | 'title' | 'status';
type SortDir = 'asc' | 'desc';
type ViewMode = 'list' | 'grid';
const VIEW_KEY = 'colabs-gigs-view';

const STATUS_ORDER: Record<Gig['status'], number> = {
  interviewing: 0,
  applied: 1,
  accepted: 2,
  rejected: 3,
};

const statusIcon = (s: Gig['status']) => {
  switch (s) {
    case 'applied':
      return <Send className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    case 'interviewing':
      return <Timer className="h-3.5 w-3.5 text-orange-400 shrink-0" />;
    case 'accepted':
      return <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />;
    case 'rejected':
      return <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />;
  }
};

const statusLabel: Record<Gig['status'], string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const statusColor: Record<Gig['status'], string> = {
  applied: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  interviewing: 'bg-orange-500/15 text-orange-500 border-orange-500/20',
  accepted: 'bg-primary/15 text-primary border-primary/20',
  rejected: 'bg-destructive/15 text-destructive border-destructive/20',
};

const difficultyColor: Record<Gig['difficulty'], string> = {
  'Entry level': 'bg-primary/15 text-primary border-primary/20',
  Intermediate: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
  Expert: 'bg-destructive/15 text-destructive border-destructive/20',
};

function StatusBadge({ status }: { readonly status: Gig['status'] }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${statusColor[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { readonly difficulty: Gig['difficulty'] }) {
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${difficultyColor[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

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
      className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
        active
          ? 'bg-primary/15 text-primary border-primary/30'
          : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function SectionDivider({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <Separator className="flex-1" />
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}

function EarningsOverview({ gigs }: { readonly gigs: Gig[] }) {
  const accepted = gigs.filter((g) => g.status === 'accepted');
  const interviewing = gigs.filter((g) => g.status === 'interviewing');
  const totalEarnings = accepted.reduce((sum, g) => sum + g.budgetValue, 0);
  const pendingEarnings = interviewing.reduce((sum, g) => sum + g.budgetValue, 0);

  const stats = [
    {
      label: 'Active gigs',
      value: accepted.length.toString(),
      icon: Briefcase,
      color: 'text-primary',
    },
    {
      label: 'In pipeline',
      value: interviewing.length.toString(),
      icon: Timer,
      color: 'text-orange-400',
    },
    {
      label: 'Earned',
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      label: 'Pending',
      value: `$${pendingEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="p-3 rounded-lg border border-border/40 bg-card/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Icon className={`h-3.5 w-3.5 ${color}`} />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ========== GIG SIDE PANEL ==========
function GigSidePanel({ gig }: { readonly gig: Gig }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-5 mt-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{gig.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{gig.company}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={gig.status} />
        <DifficultyBadge difficulty={gig.difficulty} />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{gig.description}</p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          <span>{gig.budget}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{gig.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{gig.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Posted {new Date(gig.postedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{gig.proposals} proposals</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Technologies</p>
        <div className="flex flex-wrap gap-1.5">
          {gig.technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 text-xs" onClick={() => navigate(`/gig/${gig.id}`)}>
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View Details
        </Button>
        {gig.status === 'accepted' && (
          <Button variant="outline" size="sm" className="text-xs">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Message Client
          </Button>
        )}
      </div>
    </div>
  );
}

function GigListView({ groups }: { readonly groups: { status: Gig['status']; gigs: Gig[] }[] }) {
  return (
    <div className="space-y-5">
      {groups.map(({ status, gigs: groupGigs }) => (
        <div key={status}>
          <div className="flex items-center gap-2 px-3 mb-1">
            {statusIcon(status)}
            <span className="text-[13px] font-medium text-muted-foreground">
              {statusLabel[status]}
            </span>
            <span className="text-[11px] text-muted-foreground/50">{groupGigs.length}</span>
          </div>
          <div className="space-y-px">
            {groupGigs.map((gig) => (
              <Sheet key={gig.id}>
                <SheetTrigger asChild>
                  <button className="w-full text-left px-3 py-2.5 rounded-md hover:bg-accent/50 transition-colors group flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {gig.id}
                        </span>
                        <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {gig.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {gig.company}
                        </span>
                        <span className="flex items-center gap-1">
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
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {gig.technologies.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                      <DifficultyBadge difficulty={gig.difficulty} />
                    </div>
                  </button>
                </SheetTrigger>
                <SheetContent className="w-[85vw] sm:w-[500px]" side="right">
                  <SheetHeader>
                    <SheetTitle className="text-left font-mono text-sm text-muted-foreground">
                      {gig.id}
                    </SheetTitle>
                  </SheetHeader>
                  <GigSidePanel gig={gig} />
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GigGridView({ gigs }: { readonly gigs: Gig[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {gigs.map((gig) => (
        <Sheet key={gig.id}>
          <SheetTrigger asChild>
            <Card className="border-border/40 hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {statusIcon(gig.status)}
                      <span className="text-[10px] font-mono text-muted-foreground">{gig.id}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <StatusBadge status={gig.status} />
                      </div>
                    </div>
                    <p className="text-[12px] font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {gig.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{gig.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {gig.budget}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {gig.duration}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {gig.technologies.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <DifficultyBadge difficulty={gig.difficulty} />
                  <span className="text-[10px] text-muted-foreground">
                    {gig.proposals} proposals
                  </span>
                </div>
              </CardContent>
            </Card>
          </SheetTrigger>
          <SheetContent className="w-[85vw] sm:w-[500px]" side="right">
            <SheetHeader>
              <SheetTitle className="text-left font-mono text-sm text-muted-foreground">
                {gig.id}
              </SheetTitle>
            </SheetHeader>
            <GigSidePanel gig={gig} />
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export function GigsTab() {
  const navigate = useNavigate();
  const gigs = mockGigs;
  const { data: recommendedGigRows } = useGigs();
  const recommendedGigs: ExploreGig[] = (recommendedGigRows ?? [])
    .slice(0, 4)
    .map(gigRowToExploreGig);

  // Persisted view mode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem(VIEW_KEY) as ViewMode) || 'list';
    } catch {
      return 'list';
    }
  });
  const changeView = useCallback((v: string | undefined) => {
    if (!v) return;
    const mode = v as ViewMode;
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch (err) {
      console.error('Failed to save view mode:', err);
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatuses, setFilterStatuses] = useState<Set<Gig['status']>>(new Set());
  const [filterDifficulties, setFilterDifficulties] = useState<Set<Gig['difficulty']>>(new Set());
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Saved recommended gigs
  const [savedGigIds, setSavedGigIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('colabs-saved-gigs') || '[]'));
    } catch {
      return new Set();
    }
  });
  const toggleSaveGig = useCallback((id: string) => {
    setSavedGigIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('colabs-saved-gigs', JSON.stringify([...next]));
      } catch (err) {
        console.error('Failed to save gigs:', err);
      }
      return next;
    });
  }, []);

  const toggleSet = <T,>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    return next;
  };

  const activeFilterCount = filterStatuses.size + filterDifficulties.size;

  const clearAllFilters = () => {
    setFilterStatuses(new Set());
    setFilterDifficulties(new Set());
    setSearchQuery('');
  };

  const filteredAndSorted = useMemo(() => {
    let items = [...gigs];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.company.toLowerCase().includes(q) ||
          g.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterStatuses.size > 0) items = items.filter((g) => filterStatuses.has(g.status));
    if (filterDifficulties.size > 0)
      items = items.filter((g) => filterDifficulties.has(g.difficulty));

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'budget':
          cmp = a.budgetValue - b.budgetValue;
          break;
        case 'date':
          cmp = new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [gigs, searchQuery, filterStatuses, filterDifficulties, sortField, sortDir]);

  const statusGroups = useMemo(() => {
    const order: Gig['status'][] = ['interviewing', 'applied', 'accepted', 'rejected'];
    return order
      .map((status) => ({ status, gigs: filteredAndSorted.filter((g) => g.status === status) }))
      .filter((g) => g.gigs.length > 0);
  }, [filteredAndSorted]);

  // ========== RENDER ==========
  return (
    <div className="space-y-3">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">My Gigs</h1>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium border border-primary/20">
            {gigs.filter((g) => g.status === 'accepted').length} active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={changeView} size="sm">
            <ToggleGroupItem value="list" aria-label="List view" className="h-7 w-7 p-0">
              <List className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view" className="h-7 w-7 p-0">
              <LayoutGrid className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => navigate('/marketplace')}
          >
            Browse marketplace
          </Button>
        </div>
      </div>

      {/* ===== EARNINGS OVERVIEW ===== */}
      <EarningsOverview gigs={gigs} />

      {/* ===== TOOLBAR ===== */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-0 sm:min-w-[180px] sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search gigs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                  ['status', 'Status'],
                  ['budget', 'Budget'],
                  ['date', 'Date posted'],
                  ['title', 'Title'],
                ] as [SortField, string][]
              ).map(([field, label]) => (
                <button
                  key={field}
                  onClick={() => {
                    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                    else {
                      setSortField(field);
                      setSortDir('asc');
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

      {/* Filter panels */}
      {showFilters && (
        <div className="space-y-3 p-3 rounded-lg border border-border/40 bg-card/50">
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATUSES.map((s) => (
                <FilterChip
                  key={s}
                  label={statusLabel[s]}
                  active={filterStatuses.has(s)}
                  onClick={() => setFilterStatuses(toggleSet(filterStatuses, s))}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Difficulty</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DIFFICULTIES.map((d) => (
                <FilterChip
                  key={d}
                  label={d}
                  active={filterDifficulties.has(d)}
                  onClick={() => setFilterDifficulties(toggleSet(filterDifficulties, d))}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {(activeFilterCount > 0 || searchQuery) && (
        <p className="text-[11px] text-muted-foreground px-1">
          {filteredAndSorted.length} gig{filteredAndSorted.length === 1 ? '' : 's'} found
        </p>
      )}

      {/* ===== SECTION 1: CURRENT GIGS ===== */}
      {(() => {
        if (gigs.length === 0) {
          return (
            <EmptyState
              icon={Briefcase}
              title="No gigs yet"
              description="Start exploring the marketplace to find freelance opportunities that match your skills."
              actionLabel="Browse Marketplace"
              onAction={() => navigate('/marketplace')}
            />
          );
        }
        if (filteredAndSorted.length === 0) {
          return (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <Briefcase className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p>No gigs match your filters</p>
              <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={clearAllFilters}>
                Clear filters
              </Button>
            </div>
          );
        }
        if (viewMode === 'list') {
          return <GigListView groups={statusGroups} />;
        }
        return <GigGridView gigs={filteredAndSorted} />;
      })()}

      {/* ===== DIVIDER: Recommended Gigs ===== */}
      <SectionDivider label="Recommended for you" />

      {/* ===== SECTION 2: RECOMMENDED GIGS ===== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Recommended Gigs</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => navigate('/marketplace')}
          >
            Browse all →
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Based on your skills and past gig history
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {recommendedGigs.map((gig) => (
            <ExploreGigCard
              key={gig.id}
              gig={gig}
              isSaved={savedGigIds.has(gig.id)}
              onToggleSave={toggleSaveGig}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
