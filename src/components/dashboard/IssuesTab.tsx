import { useState, useMemo, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutGrid, List, Columns3, AlertCircle, Calendar, User, MessageSquare,
  Circle, Timer, CheckCircle2, CircleDot, Filter, ArrowUpDown, X, Search,
  ExternalLink, Loader2, Plus, Check, Bookmark, BookmarkCheck, Sparkles,
  Flame, Star, GitFork, Activity, Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { IssueSidePanel, type UnifiedIssue } from "@/components/issues/IssueSidePanel";
import { IssueRow } from "@/components/issues/IssueRow";
import { useClaimedIssues } from "@/hooks/useClaimedIssues";

// ---------- Recommended mock data ----------
const recommendedIssues: (UnifiedIssue & { reason: string })[] = [
  { id: "REC-001", title: "Add TypeScript strict mode to utils package", description: "Enable strict TypeScript checking across shared utilities.", status: "todo", priority: "low", assignee: { name: "Unassigned", avatar: "" }, repo: { name: "shared-utils", owner: "oss-team", full_name: "oss-team/shared-utils" }, labels: ["good first issue", "typescript", "dx"], createdAt: "2024-01-20", comments: 2, isGoodFirstIssue: true, category: "enhancement", reason: "Matches your TypeScript stack" },
  { id: "REC-002", title: "Fix button accessibility in design system", description: "Ensure all buttons meet WCAG 2.1 AA standards.", status: "todo", priority: "medium", assignee: { name: "Unassigned", avatar: "" }, repo: { name: "ui-kit", owner: "design-org", full_name: "design-org/ui-kit" }, labels: ["good first issue", "a11y", "frontend"], createdAt: "2024-01-18", comments: 4, isGoodFirstIssue: true, category: "bug", reason: "Good first issue in React" },
  { id: "REC-003", title: "Implement dark mode toggle component", description: "Create a reusable dark mode toggle with system preference detection.", status: "todo", priority: "medium", assignee: { name: "Unassigned", avatar: "" }, repo: { name: "component-lib", owner: "ui-team", full_name: "ui-team/component-lib" }, labels: ["enhancement", "react", "css"], createdAt: "2024-01-22", comments: 1, isGoodFirstIssue: false, category: "feature", reason: "Popular in your tech stack" },
  { id: "REC-004", title: "Add unit tests for auth middleware", description: "Increase test coverage for authentication middleware functions.", status: "todo", priority: "high", assignee: { name: "Unassigned", avatar: "" }, repo: { name: "api-gateway", owner: "backend-team", full_name: "backend-team/api-gateway" }, labels: ["testing", "backend", "good first issue"], createdAt: "2024-01-19", comments: 3, isGoodFirstIssue: true, category: "enhancement", reason: "Beginner-friendly testing task" },
];

const recommendedProjects = [
  { name: "react-query-devtools", owner: "tanstack", description: "Powerful asynchronous state management for React", language: "TypeScript", stars: 38200, forks: 2400, contributors: 890, lastActive: "2h ago", technologies: ["React", "TypeScript"], openIssues: 42 },
  { name: "shadcn-ui", owner: "shadcn", description: "Beautifully designed components built with Radix and Tailwind", language: "TypeScript", stars: 52000, forks: 2900, contributors: 420, lastActive: "1h ago", technologies: ["React", "Tailwind", "Radix"], openIssues: 78 },
  { name: "supabase", owner: "supabase", description: "The open source Firebase alternative with Postgres", language: "TypeScript", stars: 64500, forks: 5800, contributors: 1200, lastActive: "30m ago", technologies: ["PostgreSQL", "TypeScript", "Go"], openIssues: 156 },
  { name: "next.js", owner: "vercel", description: "The React Framework for the Web", language: "TypeScript", stars: 118000, forks: 25300, contributors: 3100, lastActive: "15m ago", technologies: ["React", "TypeScript", "Rust"], openIssues: 234 },
];

// ---------- Constants & Helpers ----------
const ALL_STATUSES: UnifiedIssue["status"][] = ["in-progress", "todo", "in-review", "done"];
const ALL_PRIORITIES: UnifiedIssue["priority"][] = ["urgent", "high", "medium", "low"];

type SortField = "priority" | "date" | "title" | "difficulty";
type SortDir = "asc" | "desc";
type ViewMode = "list" | "kanban";

const PRIORITY_ORDER: Record<UnifiedIssue["priority"], number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const DIFFICULTY_MAP: Record<string, { label: string; color: string; order: number }> = {
  urgent: { label: "Expert", color: "bg-destructive/15 text-destructive border-destructive/20", order: 3 },
  high: { label: "Hard", color: "bg-orange-500/15 text-orange-500 border-orange-500/20", order: 2 },
  medium: { label: "Medium", color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20", order: 1 },
  low: { label: "Easy", color: "bg-primary/15 text-primary border-primary/20", order: 0 },
};

const VIEW_KEY = "colabs-issues-view";

const priorityIcon = (p: UnifiedIssue["priority"]) => {
  switch (p) {
    case "urgent": return <span className="text-destructive">⚡</span>;
    case "high": return <span className="text-orange-400">▲</span>;
    case "medium": return <span className="text-yellow-400">■</span>;
    case "low": return <span className="text-muted-foreground">▽</span>;
  }
};

const statusIcon = (s: UnifiedIssue["status"]) => {
  switch (s) {
    case "in-progress": return <Timer className="h-3.5 w-3.5 text-yellow-400 shrink-0" />;
    case "todo": return <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    case "done": return <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />;
    default: return <CircleDot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
};

const statusLabel: Record<UnifiedIssue["status"], string> = {
  "in-progress": "In Progress",
  "todo": "Todo",
  "in-review": "In Review",
  "done": "Done",
};

const statusColor: Record<UnifiedIssue["status"], string> = {
  "in-progress": "border-yellow-400/50",
  "todo": "border-muted-foreground/30",
  "in-review": "border-blue-400/50",
  "done": "border-primary/50",
};

const getPriorityColor = (priority: UnifiedIssue["priority"]) => {
  switch (priority) {
    case "urgent": return "text-destructive";
    case "high": return "text-orange-400";
    case "medium": return "text-yellow-400";
    case "low": return "text-muted-foreground";
  }
};

function DifficultyBadge({ priority }: { priority: UnifiedIssue["priority"] }) {
  const d = DIFFICULTY_MAP[priority];
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${d.color}`}>
      {d.label}
    </span>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
        active
          ? "bg-primary/15 text-primary border-primary/30"
          : "bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <Separator className="flex-1" />
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

function StreakIndicator() {
  // Simple mock streak – in the future, compute from claimed_issues claimed_at timestamps
  const streak = 5;
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
      <Flame className="h-3.5 w-3.5 text-orange-500" />
      <span className="text-[11px] font-medium text-orange-500">{streak}-day streak</span>
    </div>
  );
}

const formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toString();

const getLanguageColor = (lang: string) => {
  const colors: Record<string, string> = {
    TypeScript: "bg-blue-500", JavaScript: "bg-yellow-500", Python: "bg-green-500", Go: "bg-cyan-500", Rust: "bg-orange-500",
  };
  return colors[lang] || "bg-muted-foreground";
};

// ========== MAIN COMPONENT ==========
export function IssuesTab() {
  const navigate = useNavigate();
  const { claimedIssues, claimedIssueIds, loading: claimedLoading, toUnifiedIssue, updateStatus, unclaimIssue, claimIssue } = useClaimedIssues();

  // Persisted view mode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try { return (localStorage.getItem(VIEW_KEY) as ViewMode) || "list"; } catch { return "list"; }
  });
  const changeView = useCallback((v: string | undefined) => {
    if (!v) return;
    const mode = v as ViewMode;
    setViewMode(mode);
    try { localStorage.setItem(VIEW_KEY, mode); } catch {}
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatuses, setFilterStatuses] = useState<Set<UnifiedIssue["status"]>>(new Set());
  const [filterPriorities, setFilterPriorities] = useState<Set<UnifiedIssue["priority"]>>(new Set());
  const [filterLabels, setFilterLabels] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Saved recommended issues (localStorage)
  const [savedRecIds, setSavedRecIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("colabs-saved-rec") || "[]");
      setSavedRecIds(new Set(saved));
    } catch {}
  }, []);
  const toggleSaveRec = useCallback((id: string) => {
    setSavedRecIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("colabs-saved-rec", JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const myIssues: UnifiedIssue[] = useMemo(() => claimedIssues.map(toUnifiedIssue), [claimedIssues, toUnifiedIssue]);
  const ALL_LABELS_DYNAMIC = useMemo(() => Array.from(new Set(myIssues.flatMap(i => i.labels))).sort(), [myIssues]);

  const toggleSet = <T,>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };

  const activeFilterCount = filterStatuses.size + filterPriorities.size + filterLabels.size;

  const clearAllFilters = () => {
    setFilterStatuses(new Set());
    setFilterPriorities(new Set());
    setFilterLabels(new Set());
    setSearchQuery("");
  };

  const filteredAndSorted = useMemo(() => {
    let issues = [...myIssues];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      issues = issues.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.labels.some(l => l.toLowerCase().includes(q))
      );
    }
    if (filterStatuses.size > 0) issues = issues.filter(i => filterStatuses.has(i.status));
    if (filterPriorities.size > 0) issues = issues.filter(i => filterPriorities.has(i.priority));
    if (filterLabels.size > 0) issues = issues.filter(i => i.labels.some(l => filterLabels.has(l)));

    issues.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "priority": cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break;
        case "difficulty": cmp = DIFFICULTY_MAP[a.priority].order - DIFFICULTY_MAP[b.priority].order; break;
        case "date": cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case "title": cmp = a.title.localeCompare(b.title); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return issues;
  }, [myIssues, searchQuery, filterStatuses, filterPriorities, filterLabels, sortField, sortDir]);

  const groups = useMemo(() => {
    const statusOrder: UnifiedIssue["status"][] = ["in-progress", "todo", "in-review", "done"];
    return statusOrder
      .map(status => ({ status, issues: filteredAndSorted.filter(i => i.status === status) }))
      .filter(g => g.issues.length > 0);
  }, [filteredAndSorted]);

  const kanbanColumns = useMemo(() => {
    const statusOrder: UnifiedIssue["status"][] = ["todo", "in-progress", "in-review", "done"];
    return statusOrder.map(status => ({
      status,
      issues: filteredAndSorted.filter(i => i.status === status),
    }));
  }, [filteredAndSorted]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStatus = destination.droppableId as UnifiedIssue["status"];
    updateStatus(draggableId, newStatus);
  }, [updateStatus]);

  // ========== RENDER ==========
  return (
    <div className="space-y-3">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">My Issues</h1>
          <StreakIndicator />
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={changeView} size="sm">
            <ToggleGroupItem value="list" aria-label="List view" className="h-7 w-7 p-0">
              <List className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="kanban" aria-label="Kanban view" className="h-7 w-7 p-0">
              <Columns3 className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => navigate('/issues')}>
            View all issues
          </Button>
        </div>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-0 sm:min-w-[180px] sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search issues..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 pl-8 text-[13px] bg-transparent border-border/40" />
        </div>
        <Button variant={showFilters ? "secondary" : "ghost"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-3.5 w-3.5" />Filter
          {activeFilterCount > 0 && <span className="ml-1 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium">{activeFilterCount}</span>}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5"><ArrowUpDown className="h-3.5 w-3.5" />Sort</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1">Sort by</p>
              {([["priority", "Priority"], ["difficulty", "Difficulty"], ["date", "Date created"], ["title", "Title"]] as [SortField, string][]).map(([field, label]) => (
                <button key={field} onClick={() => { if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("asc"); } }}
                  className={`w-full text-left text-[13px] px-2 py-1.5 rounded-md transition-colors flex items-center justify-between ${sortField === field ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}>
                  {label}
                  {sortField === field && <span className="text-[10px] text-muted-foreground">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {(activeFilterCount > 0 || searchQuery) && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={clearAllFilters}><X className="h-3 w-3" /> Clear</Button>
        )}
      </div>

      {/* Filter panels */}
      {showFilters && (
        <div className="space-y-3 p-3 rounded-lg border border-border/40 bg-card/50">
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATUSES.map(s => <FilterChip key={s} label={statusLabel[s]} active={filterStatuses.has(s)} onClick={() => setFilterStatuses(toggleSet(filterStatuses, s))} />)}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Priority</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PRIORITIES.map(p => <FilterChip key={p} label={p.charAt(0).toUpperCase() + p.slice(1)} active={filterPriorities.has(p)} onClick={() => setFilterPriorities(toggleSet(filterPriorities, p))} />)}
            </div>
          </div>
          {ALL_LABELS_DYNAMIC.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_LABELS_DYNAMIC.map(l => <FilterChip key={l} label={l} active={filterLabels.has(l)} onClick={() => setFilterLabels(toggleSet(filterLabels, l))} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {(activeFilterCount > 0 || searchQuery) && (
        <p className="text-[11px] text-muted-foreground px-1">{filteredAndSorted.length} issue{filteredAndSorted.length !== 1 ? "s" : ""} found</p>
      )}

      {/* ===== SECTION 1: CURRENT ISSUES ===== */}
      {claimedLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading your issues...</span>
        </div>
      ) : myIssues.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          <CircleDot className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
          <p>No claimed issues yet</p>
          <p className="text-xs mt-1">Browse and claim issues from the Explore page</p>
          <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => navigate('/issues')}>Explore Issues</Button>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          <CircleDot className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
          <p>No issues match your filters</p>
          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={clearAllFilters}>Clear filters</Button>
        </div>
      ) : viewMode === "list" ? (
        /* ---- LIST VIEW ---- */
        <div className="space-y-5">
          {groups.map(({ status, issues }) => (
            <div key={status}>
              <div className="flex items-center gap-2 px-3 mb-1">
                {statusIcon(status)}
                <span className="text-[13px] font-medium text-muted-foreground">{statusLabel[status]}</span>
                <span className="text-[11px] text-muted-foreground/50">{issues.length}</span>
              </div>
              <div className="space-y-px">
                {issues.map(issue => (
                  <Sheet key={issue.id}>
                    <SheetTrigger asChild>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <IssueRow issue={issue} />
                        </div>
                        <DifficultyBadge priority={issue.priority} />
                      </div>
                    </SheetTrigger>
                    <SheetContent className="w-[85vw] sm:w-[500px]" side="right">
                      <SheetHeader><SheetTitle className="text-left font-mono text-sm text-muted-foreground">{issue.id}</SheetTitle></SheetHeader>
                      <IssueSidePanel issue={issue} showUnclaim onUnclaim={() => unclaimIssue(issue.id)} />
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ---- KANBAN VIEW with DnD ---- */
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-h-[300px]">
            {kanbanColumns.map(({ status, issues }) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-lg border-t-2 ${statusColor[status]} p-2 transition-colors ${snapshot.isDraggingOver ? "bg-accent/40" : "bg-card/30"}`}
                  >
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                      {statusIcon(status)}
                      <span className="text-[12px] font-medium text-muted-foreground">{statusLabel[status]}</span>
                      <span className="text-[11px] text-muted-foreground/50 ml-auto">{issues.length}</span>
                    </div>
                    <div className="space-y-2 min-h-[40px]">
                      {issues.map((issue, index) => (
                        <Draggable draggableId={issue.id} index={index} key={issue.id}>
                          {(dragProvided, dragSnapshot) => (
                            <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                              <Sheet>
                                <SheetTrigger asChild>
                                  <button className={`w-full text-left p-2.5 rounded-md bg-background border transition-all cursor-pointer group ${dragSnapshot.isDragging ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border/40 hover:border-border hover:shadow-sm"}`}>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      {priorityIcon(issue.priority)}
                                      <span className="text-[10px] font-mono text-muted-foreground">{issue.id}</span>
                                      <div className="ml-auto"><DifficultyBadge priority={issue.priority} /></div>
                                    </div>
                                    <p className="text-[12px] font-medium text-foreground line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">{issue.title}</p>
                                    <p className="text-[10px] text-muted-foreground mb-2 truncate">{issue.repo.owner}/{issue.repo.name}</p>
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {issue.labels.slice(0, 2).map(l => (
                                        <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{l}</span>
                                      ))}
                                    </div>
                                  </button>
                                </SheetTrigger>
                                <SheetContent className="w-[85vw] sm:w-[500px]" side="right">
                                  <SheetHeader><SheetTitle className="text-left font-mono text-sm text-muted-foreground">{issue.id}</SheetTitle></SheetHeader>
                                  <IssueSidePanel issue={issue} showUnclaim onUnclaim={() => unclaimIssue(issue.id)} />
                                </SheetContent>
                              </Sheet>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {issues.length === 0 && (
                        <p className="text-[11px] text-muted-foreground/40 text-center py-4">No issues</p>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* ===== DIVIDER: Recommended Issues ===== */}
      <SectionDivider label="Recommended for you" />

      {/* ===== SECTION 2: RECOMMENDED ISSUES ===== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Recommended Issues</h2>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => navigate('/issues')}>
            Browse all →
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Based on your tech stack and contribution history</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {recommendedIssues.map(issue => {
            const isClaimed = claimedIssueIds.has(issue.id);
            const isSaved = savedRecIds.has(issue.id);
            return (
              <Sheet key={issue.id}>
                <SheetTrigger asChild>
                  <Card className="border-border/40 hover:border-primary/30 transition-all cursor-pointer group">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{issue.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{issue.repo.owner}/{issue.repo.name}</p>
                        </div>
                        <DifficultyBadge priority={issue.priority} />
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {issue.labels.slice(0, 3).map(l => (
                          <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{l}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/30">
                        <span className="text-[10px] text-primary/70 italic">{issue.reason}</span>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${isSaved ? "text-primary" : "text-muted-foreground"}`} onClick={() => toggleSaveRec(issue.id)}>
                            {isSaved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant={isClaimed ? "secondary" : "outline"}
                            size="sm"
                            className={`h-6 text-[10px] px-2 gap-1 ${isClaimed ? "text-primary" : ""}`}
                            onClick={() => { if (!isClaimed) claimIssue(issue); }}
                            disabled={isClaimed}
                          >
                            {isClaimed ? <><Check className="h-2.5 w-2.5" />Claimed</> : <><Plus className="h-2.5 w-2.5" />Claim</>}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SheetTrigger>
                <SheetContent className="w-[85vw] sm:w-[500px]" side="right">
                  <SheetHeader><SheetTitle className="text-left font-mono text-sm text-muted-foreground">{issue.id}</SheetTitle></SheetHeader>
                  <IssueSidePanel issue={issue} showSave showClaim isClaimed={isClaimed} onClaim={() => claimIssue(issue)} />
                </SheetContent>
              </Sheet>
            );
          })}
        </div>
      </div>

      {/* ===== DIVIDER: Recommended Projects ===== */}
      <SectionDivider label="Explore projects" />

      {/* ===== SECTION 3: RECOMMENDED PROJECTS ===== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Recommended Projects</h2>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => navigate('/projects')}>
            View all →
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Projects matching your tech stack and interests</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {recommendedProjects.map(project => (
            <Card key={project.name} className="border-border/40 hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => window.open(`https://github.com/${project.owner}/${project.name}`, '_blank')}>
              <CardContent className="p-3 space-y-2">
                <div>
                  <h3 className="text-[12px] font-semibold text-foreground group-hover:text-primary transition-colors">
                    <span className="text-muted-foreground font-normal">{project.owner}/</span>{project.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-border/30 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getLanguageColor(project.language)}`} />
                    <span className="text-[10px]">{project.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span className="text-[10px]">{formatNumber(project.stars)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    <span className="text-[10px]">{formatNumber(project.forks)}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-[10px]">{project.openIssues} issues</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
