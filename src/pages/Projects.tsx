import { useState, useMemo, useEffect } from 'react';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/AppLayout';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectGrid } from '@/components/ProjectGrid';
import { ProjectClickHandler } from '@/components/ProjectClickHandler';
import { Search, Filter, Plus, SlidersHorizontal, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  technologies: string[];
  project_type: string;
  visibility: string;
  is_paid: boolean;
  compensation_type?: string;
  budget?: string;
  currency?: string;
  team_size: string;
  experience_level: string;
  duration: string;
  category?: string;
  industry?: string;
  creator_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string[]>([]);
  const [filterPaid, setFilterPaid] = useState<'any' | 'paid' | 'unpaid'>('any');
  const [filterIndustry, setFilterIndustry] = useState<string[]>([]);
  const [filterStack, setFilterStack] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const industries = ['Fintech', 'E-commerce', 'Blockchain', 'AI', 'DevTools'];
  const stacks = ['Frontend', 'Backend', 'Fullstack'];
  const filters = [
    'All',
    'React',
    'Python',
    'TypeScript',
    'Go',
    'Next.js',
    'Ruby on Rails',
    'Java',
    'Vue.js',
  ];

  useEffect(() => {
    document.title = 'Explore Projects | Colabs';
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .in('visibility', ['public', 'unlisted'])
        .order('created_at', { ascending: false });
      if (!error) setProjects(data || []);
    } finally {
      setLoading(false);
    }
  };

  const transformProjectToCard = (project: Project) => ({
    name: project.name,
    description: project.description,
    owner: 'Creator',
    language: project.technologies[0] || 'JavaScript',
    stars: Math.floor(Math.random() * 200),
    forks: Math.floor(Math.random() * 50),
    contributors: 2 + Math.floor(Math.random() * 15),
    languageColor: 'bg-blue-500',
    technologies: project.technologies,
    status: project.status,
    isPaid: project.is_paid,
  });

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const matchesSearch =
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          selectedFilter === 'All' ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(selectedFilter.toLowerCase())
          );
        const matchesDifficulty =
          filterDifficulty.length === 0 ||
          filterDifficulty.includes(
            project.experience_level === 'beginner'
              ? 'Beginner'
              : project.experience_level === 'intermediate'
                ? 'Intermediate'
                : 'Advanced'
          );
        const matchesPaid = filterPaid === 'any' || project.is_paid === (filterPaid === 'paid');
        const matchesIndustry =
          filterIndustry.length === 0 ||
          (project.industry && filterIndustry.includes(project.industry));
        return (
          matchesSearch && matchesFilter && matchesDifficulty && matchesPaid && matchesIndustry
        );
      })
      .map(transformProjectToCard);
  }, [projects, searchQuery, selectedFilter, filterDifficulty, filterPaid, filterIndustry]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">Explore Projects</h1>
            <Button size="sm" className="gap-2" onClick={() => setCreateProjectOpen(true)}>
              <Plus className="h-4 w-4" />
              Add project
            </Button>
          </div>

          {/* Search & Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Sort: {sortBy}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('Recent')}>Most Recent</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('Popular')}>
                  Most Popular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('Stars')}>Most Stars</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </div>

          {/* Technology Filter Tags */}
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <Badge
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'secondary'}
                className="cursor-pointer text-xs px-2.5 py-0.5"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
            {selectedFilter !== 'All' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => {
                  setSelectedFilter('All');
                  setSearchQuery('');
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 && searchQuery ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No projects found matching your search.</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground mb-3">
                No projects yet. Be the first to create one!
              </p>
              <Button size="sm" onClick={() => setCreateProjectOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create project
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery ? `${filteredProjects.length} results` : `${projects.length} projects`}
              </p>
              <ProjectGrid>
                {(searchQuery ? filteredProjects : projects.map(transformProjectToCard)).map(
                  (project, index) => {
                    const dbProject = projects.find((p) => p.name === project.name);
                    return (
                      <ProjectClickHandler key={dbProject?.id || index} projectId={dbProject?.id}>
                        <ProjectCard {...project} />
                      </ProjectClickHandler>
                    );
                  }
                )}
              </ProjectGrid>
            </div>
          )}
        </div>

        {/* Filter Sheet */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader>
              <SheetTitle className="text-sm">Filter projects</SheetTitle>
              <SheetDescription className="text-xs">
                Refine by difficulty, compensation, and industry.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-5">
              <div>
                <h4 className="text-xs font-medium text-foreground mb-2">Difficulty</h4>
                <div className="space-y-2">
                  {difficulties.map((d) => (
                    <div key={d} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diff-${d}`}
                        checked={filterDifficulty.includes(d)}
                        onCheckedChange={(checked) =>
                          checked
                            ? setFilterDifficulty([...filterDifficulty, d])
                            : setFilterDifficulty(filterDifficulty.filter((x) => x !== d))
                        }
                      />
                      <Label htmlFor={`diff-${d}`} className="text-xs">
                        {d}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-xs font-medium text-foreground mb-2">Compensation</h4>
                <RadioGroup
                  value={filterPaid}
                  onValueChange={(val) => setFilterPaid(val as 'any' | 'paid' | 'unpaid')}
                  className="space-y-2"
                >
                  {['any', 'paid', 'unpaid'].map((v) => (
                    <div key={v} className="flex items-center space-x-2">
                      <RadioGroupItem value={v} id={`paid-${v}`} />
                      <Label htmlFor={`paid-${v}`} className="text-xs capitalize">
                        {v}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <Separator />
              <div>
                <h4 className="text-xs font-medium text-foreground mb-2">Industry</h4>
                <div className="space-y-2">
                  {industries.map((ind) => (
                    <div key={ind} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ind-${ind}`}
                        checked={filterIndustry.includes(ind)}
                        onCheckedChange={(checked) =>
                          checked
                            ? setFilterIndustry([...filterIndustry, ind])
                            : setFilterIndustry(filterIndustry.filter((x) => x !== ind))
                        }
                      />
                      <Label htmlFor={`ind-${ind}`} className="text-xs">
                        {ind}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SheetFooter className="gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterDifficulty([]);
                  setFilterPaid('any');
                  setFilterIndustry([]);
                  setFilterStack([]);
                }}
              >
                Clear all
              </Button>
              <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                Apply
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
      </div>
    </AppLayout>
  );
};

export default Projects;
