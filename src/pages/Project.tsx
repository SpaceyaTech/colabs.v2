import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ExternalLink,
  Star,
  GitFork,
  Eye,
  Clock,
  Loader2,
  FileText,
  MessageSquare,
  BookOpen,
  Pencil,
  ChevronDown,
  Circle,
  Pause,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { CreateProjectDialog, EditableProject } from '@/components/CreateProjectDialog';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import defaultProjectImage from '@/assets/default-project-image.jpg';

interface Project {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  technologies: string[];
  project_type: string;
  visibility: string;
  compensation_type: string | null;
  budget: string | null;
  currency: string;
  team_size: string;
  experience_level: string;
  duration: string;
  category: string | null;
  industry: string | null;
  launch_readiness: string;
  status: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  creator_id: string;
  github_repo_url: string | null;
  external_links: Record<string, string> | null;
  allow_applications: boolean;
  requires_approval: boolean;
  invite_emails: string[] | null;
}

interface GitHubData {
  repo: {
    full_name: string;
    description: string;
    html_url: string;
    stars: number;
    forks: number;
    watchers: number;
    open_issues: number;
    language: string;
    topics: string[];
    default_branch: string;
    updated_at: string;
    license: string | null;
  } | null;
  contributors: {
    login: string;
    avatar_url: string;
    contributions: number;
    html_url: string;
  }[];
  issues: {
    id: number;
    number: number;
    title: string;
    labels: { name: string; color: string }[];
    state: string;
    created_at: string;
    comments: number;
    html_url: string;
    user: { login: string; avatar_url: string };
    is_good_first_issue: boolean;
  }[];
  readme_url: string;
}

const TOOL_ICONS: Record<string, { label: string; color: string }> = {
  figma: { label: 'Figma', color: 'bg-[#F24E1E]/10 text-[#F24E1E]' },
  linear: { label: 'Linear', color: 'bg-[#5E6AD2]/10 text-[#5E6AD2]' },
  clickup: { label: 'ClickUp', color: 'bg-[#7B68EE]/10 text-[#7B68EE]' },
  slack: {
    label: 'Slack',
    color: 'bg-[#4A154B]/10 text-[#4A154B] dark:bg-[#E01E5A]/10 dark:text-[#E01E5A]',
  },
  discord: { label: 'Discord', color: 'bg-[#5865F2]/10 text-[#5865F2]' },
  notion: { label: 'Notion', color: 'bg-foreground/10 text-foreground' },
  jira: { label: 'Jira', color: 'bg-[#0052CC]/10 text-[#0052CC]' },
  trello: { label: 'Trello', color: 'bg-[#0079BF]/10 text-[#0079BF]' },
};

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isOwner = user?.id === project?.creator_id;

  const STATUS_OPTIONS = [
    { value: 'active', label: 'Active', icon: Circle, color: 'text-emerald-500' },
    { value: 'paused', label: 'Paused', icon: Pause, color: 'text-amber-500' },
    { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-blue-500' },
    { value: 'archived', label: 'Archived', icon: Archive, color: 'text-muted-foreground' },
  ];

  const currentStatus = STATUS_OPTIONS.find(s => s.value === project?.status) || STATUS_OPTIONS[0];

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', project.id);
    if (!error) {
      setProject({ ...project, status: newStatus });
    }
  };

  const fetchProject = useCallback(async () => {
    if (!id) {
      setError('Project ID not provided');
      setLoading(false);
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!data) setError('Project not found');
      else setProject(data as unknown as Project);
    } catch {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (!project?.github_repo_url) return;
    const fetchGitHub = async () => {
      setGithubLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('github-project-data', {
          body: { repoUrl: project.github_repo_url },
        });
        if (!error && data?.success) setGithubData(data.data);
      } catch (err) {
        console.error('Failed to fetch GitHub data:', err);
      } finally {
        setGithubLoading(false);
      }
    };
    fetchGitHub();
  }, [project?.github_repo_url]);

  useEffect(() => {
    if (!project) return;
    document.title = `${project.name} | Colabs`;
  }, [project]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">{error || 'Project not found.'}</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const externalLinks = project.external_links || {};
  const hasExternalLinks = Object.keys(externalLinks).length > 0;
  const repo = githubData?.repo;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg border border-border/50 overflow-hidden shrink-0 bg-muted">
            <img
              src={project.logo_url || defaultProjectImage}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold leading-tight">{project.name}</h1>
              {isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2 py-0.5 text-[10px] capitalize hover:bg-accent transition-colors">
                      <currentStatus.icon className={`h-3 w-3 ${currentStatus.color}`} />
                      {currentStatus.label}
                      <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[140px]">
                    {STATUS_OPTIONS.map(opt => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className="text-xs gap-2"
                      >
                        <opt.icon className={`h-3.5 w-3.5 ${opt.color}`} />
                        {opt.label}
                        {opt.value === project.status && (
                          <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {project.status}
                </Badge>
              )}
              {project.is_paid && (
                <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  Paid
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {repo && (
            <>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3" /> {repo.stars.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork className="h-3 w-3" /> {repo.forks.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" /> {repo.watchers.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {repo.open_issues} issues
              </span>
              {repo.language && (
                <Badge variant="secondary" className="text-[10px]">
                  {repo.language}
                </Badge>
              )}
              {repo.license && (
                <Badge variant="outline" className="text-[10px]">
                  {repo.license}
                </Badge>
              )}
            </>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated{' '}
            {formatDistanceToNow(new Date(repo?.updated_at || project.updated_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Tech stack */}
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map(tech => (
              <Badge key={tech} variant="secondary" className="text-[10px] font-normal">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {project.github_repo_url && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={githubData?.readme_url || project.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" /> README
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> GitHub
                </a>
              </Button>
            </>
          )}
          <Button size="sm" asChild>
            <Link to={`/projects/${project.id}/propose`}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> Submit Proposal
            </Link>
          </Button>
        </div>

        <Separator className="opacity-50" />

        {/* External Tools */}
        {hasExternalLinks && (
          <section className="space-y-2.5">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Project Tools
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(externalLinks).map(([key, url]) => {
                const tool = TOOL_ICONS[key.toLowerCase()] || {
                  label: key,
                  color: 'bg-muted text-muted-foreground',
                };
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-80 ${tool.color}`}
                  >
                    <ExternalLink className="h-3 w-3" /> {tool.label}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Project Info */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Team Size',
                value:
                  project.team_size.replace('-', '–') +
                  ' member' +
                  (project.team_size === '1' ? '' : 's'),
              },
              { label: 'Duration', value: formatDuration(project.duration) },
              { label: 'Level', value: project.experience_level },
              { label: 'Type', value: project.project_type },
              ...(project.category
                ? [{ label: 'Category', value: project.category.replace('-', ' ') }]
                : []),
              ...(project.industry ? [{ label: 'Industry', value: project.industry }] : []),
              ...(project.is_paid && project.budget
                ? [{ label: 'Budget', value: `${project.currency} ${project.budget}` }]
                : []),
              ...(project.compensation_type
                ? [{ label: 'Payment', value: project.compensation_type }]
                : []),
            ].map(item => (
              <div key={item.label} className="rounded-lg border border-border/50 p-3 space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="text-sm font-medium capitalize">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contributors */}
        {githubData && githubData.contributors.length > 0 && (
          <>
            <Separator className="opacity-50" />
            <section className="space-y-2.5">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contributors ({githubData.contributors.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {githubData.contributors.map(c => (
                  <a
                    key={c.login}
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg border border-border/50 px-2.5 py-1.5 hover:border-border transition-colors"
                    title={`${c.login} – ${c.contributions} contributions`}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={c.avatar_url} alt={c.login} />
                      <AvatarFallback className="text-[8px]">
                        {c.login[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {c.login}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">{c.contributions}</span>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Open Issues */}
        {githubData && githubData.issues.length > 0 && (
          <>
            <Separator className="opacity-50" />
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Open Issues ({repo?.open_issues || githubData.issues.length})
                </h2>
                {project.github_repo_url && (
                  <a
                    href={`${project.github_repo_url}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all →
                  </a>
                )}
              </div>
              <div className="space-y-1">
                {githubData.issues.map(issue => (
                  <a
                    key={issue.id}
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-lg border border-border/50 px-3 py-2.5 hover:border-border hover:bg-accent/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {issue.is_good_first_issue && (
                          <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0">
                            Good first issue
                          </Badge>
                        )}
                        <span className="text-xs font-medium truncate group-hover:text-foreground text-foreground/90">
                          {issue.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>#{issue.number}</span>
                        <span>
                          opened{' '}
                          {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                        </span>
                        {issue.comments > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <MessageSquare className="h-2.5 w-2.5" /> {issue.comments}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {issue.labels.slice(0, 3).map(l => (
                        <span
                          key={l.name}
                          className="text-[9px] px-1.5 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `#${l.color}20`,
                            borderColor: `#${l.color}40`,
                            color: `#${l.color}`,
                          }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}

        {githubLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading GitHub data…
          </div>
        )}

        {!project.github_repo_url && (
          <div className="rounded-lg border border-dashed border-border/50 p-6 text-center space-y-1.5">
            <p className="text-sm text-muted-foreground">No GitHub repository linked</p>
            <p className="text-xs text-muted-foreground/60">
              {isOwner
                ? 'Click Edit to add a GitHub URL and unlock live stats.'
                : 'The project creator can add a GitHub URL to show contributors, issues, and more.'}
            </p>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs gap-1.5"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3 w-3" /> Add GitHub URL
              </Button>
            )}
          </div>
        )}

        <div className="h-8" />
      </div>

      {/* Edit Dialog */}
      {isOwner && (
        <CreateProjectDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          editProject={project as EditableProject}
          onSaved={() => {
            setEditOpen(false);
            setLoading(true);
            fetchProject();
          }}
        />
      )}
    </AppLayout>
  );
};

function formatDuration(duration: string) {
  const map: Record<string, string> = {
    '1week': '1 Week',
    '1month': '1 Month',
    '1-3months': '1–3 Months',
    '3-6months': '3–6 Months',
    '6months+': '6+ Months',
  };
  return map[duration] || duration;
}

export default ProjectPage;
