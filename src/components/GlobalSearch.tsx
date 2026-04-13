import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FolderGit2, AlertCircle, Briefcase, Loader2, Command } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'issue' | 'gig';
  meta?: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${searchQuery}%`;

      // Search projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, description, project_type')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      // Search GitHub repositories (issues source)
      const { data: repos } = await supabase
        .from('github_repositories')
        .select('id, name, description, language')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      const searchResults: SearchResult[] = [];

      // Add projects
      projects?.forEach((project) => {
        searchResults.push({
          id: project.id,
          title: project.name,
          description: project.description || 'No description',
          type: 'project',
          meta: project.project_type,
        });
      });

      // Add repos as "issues" source
      repos?.forEach((repo) => {
        searchResults.push({
          id: repo.id,
          title: repo.name,
          description: repo.description || 'No description',
          type: 'issue',
          meta: repo.language || 'Repository',
        });
      });

      // Add projects as gigs (paid projects)
      const { data: gigs } = await supabase
        .from('projects')
        .select('id, name, description, budget')
        .eq('is_paid', true)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      gigs?.forEach((gig) => {
        searchResults.push({
          id: gig.id,
          title: gig.name,
          description: gig.description || 'No description',
          type: 'gig',
          meta: gig.budget ? `$${gig.budget}` : 'Paid',
        });
      });

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i < results.length - 1 ? i + 1 : i));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : i));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');

    switch (result.type) {
      case 'project':
        navigate(`/project/${result.id}`);
        break;
      case 'issue':
        navigate(`/issues`);
        break;
      case 'gig':
        navigate(`/gig/${result.id}`);
        break;
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'project':
        return <FolderGit2 className="h-4 w-4 text-blue-500" />;
      case 'issue':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'gig':
        return <Briefcase className="h-4 w-4 text-green-500" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'project':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'issue':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'gig':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl overflow-hidden">
          <div className="flex items-center border-b px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, issues, and gigs..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
              autoFocus
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          <ScrollArea className="max-h-[400px]">
            {results.length === 0 && query && !loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            ) : results.length === 0 && !query ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Start typing to search across projects, issues, and gigs</p>
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                      selectedIndex === index ? 'bg-accent' : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="mt-0.5">{getIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.title}</span>
                        <Badge
                          variant="outline"
                          className={cn('text-xs shrink-0', getTypeColor(result.type))}
                        >
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {result.description}
                      </p>
                      {result.meta && (
                        <span className="text-xs text-muted-foreground">{result.meta}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↵</kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border">Esc</kbd>
              Close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
