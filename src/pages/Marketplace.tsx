import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  X,
  Briefcase,
  Package,
  Star,
  Eye,
  Download,
  ArrowUpDown,
} from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';
import { EmptyState } from '@/components/EmptyState';
import { ExploreGigCard, type ExploreGig } from '@/components/ExploreGigCard';
import { useGigs, gigRowToExploreGig } from '@/hooks/useGigs';

// ---- Mock software data (kept as-is, not migrated yet) ----
interface Software {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  views: number;
  downloads: number;
  tags: string[];
  image: string;
  industry: string;
  softwareType: string[];
  techStack: string[];
  launchReadiness: string;
  seller: { name: string; logo?: string; verified: boolean };
  createdAt: string;
  featured?: boolean;
}

const mockSoftware: Software[] = [
  {
    id: 's1',
    name: 'E-commerce Dashboard Pro',
    description:
      'Modern React dashboard with advanced analytics, real-time data visualization, and complete admin panel.',
    price: 149,
    rating: 4.8,
    views: 2345,
    downloads: 189,
    tags: ['React', 'TypeScript', 'Tailwind', 'Charts'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    industry: 'E-commerce',
    softwareType: ['Web Apps'],
    techStack: ['React', 'TypeScript', 'Tailwind'],
    launchReadiness: 'Ready to Launch',
    seller: { name: 'DevStudio Pro', verified: true },
    createdAt: '2024-01-15',
    featured: true,
  },
  {
    id: 's2',
    name: 'AI Content Generator API',
    description:
      'Python-based content generation API with GPT-4 integration for blogs and marketing copy.',
    price: 299,
    rating: 4.9,
    views: 3567,
    downloads: 234,
    tags: ['Python', 'OpenAI', 'FastAPI', 'AI/ML'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    industry: 'AI/ML',
    softwareType: ['APIs & SDKs'],
    techStack: ['Python', 'FastAPI', 'OpenAI'],
    launchReadiness: 'Revenue-Generating',
    seller: { name: 'AI Innovators', verified: true },
    createdAt: '2024-02-20',
    featured: true,
  },
  {
    id: 's3',
    name: 'Mobile Banking Starter Kit',
    description:
      'Complete Flutter banking app with secure authentication and payment integrations.',
    price: 399,
    rating: 4.7,
    views: 1892,
    downloads: 87,
    tags: ['Flutter', 'Dart', 'Firebase', 'Fintech'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    industry: 'Fintech',
    softwareType: ['Mobile Apps'],
    techStack: ['Flutter', 'Dart', 'Firebase'],
    launchReadiness: 'MVP',
    seller: { name: 'MobileFirst Labs', verified: true },
    createdAt: '2024-03-01',
  },
  {
    id: 's4',
    name: 'SaaS Boilerplate',
    description:
      'Production-ready SaaS starter with authentication, billing, team management, and admin dashboard.',
    price: 199,
    rating: 4.6,
    views: 4521,
    downloads: 312,
    tags: ['Next.js', 'Prisma', 'Stripe', 'Auth'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    industry: 'SaaS',
    softwareType: ['Web Apps'],
    techStack: ['Next.js', 'Prisma', 'PostgreSQL'],
    launchReadiness: 'Ready to Launch',
    seller: { name: 'BoilerplateHQ', verified: false },
    createdAt: '2024-03-10',
  },
];

const categories = ['Development', 'Design', 'DevOps', 'Blockchain', 'Data Science'];
const difficulties = ['Entry level', 'Intermediate', 'Expert'];
const industries = ['E-commerce', 'Fintech', 'AI/ML', 'SaaS', 'Healthcare'];
const techStacks = ['React', 'Next.js', 'Flutter', 'Python', 'Node.js', 'TypeScript'];

function GigFilters({
  filters,
  onChange,
}: {
  readonly filters: { difficulty: string[]; category: string[]; isUrgent: boolean };
  readonly onChange: (
    updater: (prev: { difficulty: string[]; category: string[]; isUrgent: boolean }) => {
      difficulty: string[];
      category: string[];
      isUrgent: boolean;
    }
  ) => void;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Difficulty</p>
        <div className="flex flex-wrap gap-1.5">
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() =>
                onChange(p => ({
                  ...p,
                  difficulty: p.difficulty.includes(d)
                    ? p.difficulty.filter(x => x !== d)
                    : [...p.difficulty, d],
                }))
              }
              className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                filters.difficulty.includes(d)
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button
              key={c}
              onClick={() =>
                onChange(p => ({
                  ...p,
                  category: p.category.includes(c)
                    ? p.category.filter(x => x !== c)
                    : [...p.category, c],
                }))
              }
              className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                filters.category.includes(c)
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="f-urgent"
          checked={filters.isUrgent}
          onCheckedChange={(c: boolean) => onChange(p => ({ ...p, isUrgent: !!c }))}
        />
        <label htmlFor="f-urgent" className="text-xs text-muted-foreground">
          Urgent only
        </label>
      </div>
    </>
  );
}

function SoftwareFilters({
  filters,
  onChange,
}: {
  readonly filters: { industry: string[]; techStack: string[] };
  readonly onChange: (
    updater: (prev: { industry: string[]; techStack: string[] }) => {
      industry: string[];
      techStack: string[];
    }
  ) => void;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Industry</p>
        <div className="flex flex-wrap gap-1.5">
          {industries.map(i => (
            <button
              key={i}
              onClick={() =>
                onChange(p => ({
                  ...p,
                  industry: p.industry.includes(i)
                    ? p.industry.filter(x => x !== i)
                    : [...p.industry, i],
                }))
              }
              className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                filters.industry.includes(i)
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tech Stack</p>
        <div className="flex flex-wrap gap-1.5">
          {techStacks.map(t => (
            <button
              key={t}
              onClick={() =>
                onChange(p => ({
                  ...p,
                  techStack: p.techStack.includes(t)
                    ? p.techStack.filter(x => x !== t)
                    : [...p.techStack, t],
                }))
              }
              className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                filters.techStack.includes(t)
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function GigsContentView({
  loading,
  gigs,
  savedGigIds,
  onToggleSave,
  onClearFilters,
}: {
  readonly loading: boolean;
  readonly gigs: ExploreGig[];
  readonly savedGigIds: Set<string>;
  readonly onToggleSave: (id: string) => void;
  readonly onClearFilters: () => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No gigs found"
        description="Try adjusting your filters."
        actionLabel="Clear Filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {gigs.map(gig => (
        <ExploreGigCard
          key={gig.id}
          gig={gig}
          isSaved={savedGigIds.has(gig.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}

function SoftwareContentView({
  software,
  onClearFilters,
}: {
  readonly software: Software[];
  readonly onClearFilters: () => void;
}) {
  const navigate = useNavigate();

  if (software.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No software found"
        description="Try adjusting your filters."
        actionLabel="Clear Filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {software.map(sw => (
        <Card
          key={sw.id}
          className="border-border/40 overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
          onClick={() => navigate(`/software/${sw.id}`)}
        >
          <div className="aspect-video overflow-hidden relative">
            <img
              src={sw.image}
              alt={sw.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {sw.featured && (
              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px]">
                Featured
              </Badge>
            )}
          </div>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start gap-2">
              <CompanyLogo logoUrl={sw.seller.logo} companyName={sw.seller.name} size="sm" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[12px] group-hover:text-primary transition-colors">
                  {sw.name}
                </h3>
                <span className="text-[10px] text-muted-foreground">{sw.seller.name}</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{sw.description}</p>
            <div className="flex flex-wrap gap-1">
              {sw.tags.slice(0, 3).map(t => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                {sw.rating}
              </span>
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {sw.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5">
                <Download className="h-3 w-3" />
                {sw.downloads}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/30">
              <span className="text-sm font-bold text-primary">${sw.price}</span>
              <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const Marketplace = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'gigs' | 'software'>('gigs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const [gigFilters, setGigFilters] = useState({
    difficulty: [] as string[],
    category: [] as string[],
    isUrgent: false,
  });
  const [softwareFilters, setSoftwareFilters] = useState({
    industry: [] as string[],
    techStack: [] as string[],
  });

  // Fetch gigs from Supabase
  const { data: gigRows, isLoading: gigsLoading } = useGigs();
  const gigs: ExploreGig[] = useMemo(() => (gigRows ?? []).map(gigRowToExploreGig), [gigRows]);

  // Saved gigs
  const [savedGigIds, setSavedGigIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('colabs-saved-gigs') || '[]');
      setSavedGigIds(new Set(saved));
    } catch (err) {
      console.error('Failed to load saved gigs:', err);
    }
  }, []);
  const toggleSaveGig = useCallback((id: string) => {
    setSavedGigIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('colabs-saved-gigs', JSON.stringify([...next]));
      } catch (err) {
        console.error('Failed to persist saved gigs:', err);
      }
      return next;
    });
  }, []);

  const filteredGigs = useMemo(() => {
    return gigs
      .filter(gig => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          gig.title.toLowerCase().includes(q) ||
          gig.technologies.some(s => s.toLowerCase().includes(q));
        const matchesDifficulty =
          gigFilters.difficulty.length === 0 || gigFilters.difficulty.includes(gig.difficulty);
        const matchesCategory =
          gigFilters.category.length === 0 || gigFilters.category.includes(gig.category || '');
        const matchesUrgent = !gigFilters.isUrgent || gig.isUrgent;
        return matchesSearch && matchesDifficulty && matchesCategory && matchesUrgent;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'budget-high':
            return b.budgetValue - a.budgetValue;
          case 'budget-low':
            return a.budgetValue - b.budgetValue;
          default:
            return 0;
        }
      });
  }, [gigs, searchQuery, gigFilters, sortBy]);

  const filteredSoftware = useMemo(() => {
    return mockSoftware
      .filter(sw => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || sw.name.toLowerCase().includes(q);
        const matchesIndustry =
          softwareFilters.industry.length === 0 || softwareFilters.industry.includes(sw.industry);
        const matchesTech =
          softwareFilters.techStack.length === 0 ||
          softwareFilters.techStack.some(t => sw.techStack.includes(t));
        return matchesSearch && matchesIndustry && matchesTech;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-high':
            return b.price - a.price;
          case 'price-low':
            return a.price - b.price;
          case 'rating':
            return b.rating - a.rating;
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [searchQuery, softwareFilters, sortBy]);

  const clearFilters = () => {
    if (activeTab === 'gigs') {
      setGigFilters({ difficulty: [], category: [], isUrgent: false });
    } else {
      setSoftwareFilters({ industry: [], techStack: [] });
    }
    setSearchQuery('');
  };

  const activeFilterCount =
    activeTab === 'gigs'
      ? gigFilters.difficulty.length + gigFilters.category.length + (gigFilters.isUrgent ? 1 : 0)
      : softwareFilters.industry.length + softwareFilters.techStack.length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">Marketplace</h1>
            <Tabs
              value={activeTab}
              onValueChange={v => {
                setActiveTab(v as 'gigs' | 'software');
                setSearchQuery('');
              }}
            >
              <TabsList className="bg-muted/50 h-8">
                <TabsTrigger value="gigs" className="text-xs gap-1.5 h-7 px-3">
                  <Briefcase className="h-3.5 w-3.5" /> Gigs
                </TabsTrigger>
                <TabsTrigger value="software" className="text-xs gap-1.5 h-7 px-3">
                  <Package className="h-3.5 w-3.5" /> Software
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-0 sm:min-w-[180px] sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={activeTab === 'gigs' ? 'Search gigs, skills...' : 'Search software...'}
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
              <Filter className="h-3.5 w-3.5" /> Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {activeTab === 'gigs' ? (
                  <>
                    <DropdownMenuCheckboxItem
                      checked={sortBy === 'newest'}
                      onCheckedChange={() => setSortBy('newest')}
                    >
                      Newest
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortBy === 'budget-high'}
                      onCheckedChange={() => setSortBy('budget-high')}
                    >
                      Budget: High → Low
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortBy === 'budget-low'}
                      onCheckedChange={() => setSortBy('budget-low')}
                    >
                      Budget: Low → High
                    </DropdownMenuCheckboxItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuCheckboxItem
                      checked={sortBy === 'newest'}
                      onCheckedChange={() => setSortBy('newest')}
                    >
                      Newest
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortBy === 'price-high'}
                      onCheckedChange={() => setSortBy('price-high')}
                    >
                      Price: High → Low
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortBy === 'rating'}
                      onCheckedChange={() => setSortBy('rating')}
                    >
                      Highest Rated
                    </DropdownMenuCheckboxItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {(activeFilterCount > 0 || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-3 p-3 rounded-lg border border-border/40 bg-card/50">
              {activeTab === 'gigs' ? (
                <GigFilters filters={gigFilters} onChange={setGigFilters as any} />
              ) : (
                <SoftwareFilters filters={softwareFilters} onChange={setSoftwareFilters as any} />
              )}
            </div>
          )}

          {/* Results count */}
          <p className="text-[11px] text-muted-foreground">
            Showing {activeTab === 'gigs' ? filteredGigs.length : filteredSoftware.length} results
          </p>

          {/* Content */}
          {activeTab === 'gigs' ? (
            <GigsContentView
              loading={gigsLoading}
              gigs={filteredGigs}
              savedGigIds={savedGigIds}
              onToggleSave={toggleSaveGig}
              onClearFilters={clearFilters}
            />
          ) : (
            <SoftwareContentView software={filteredSoftware} onClearFilters={clearFilters} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Marketplace;
