import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, X, Upload, Globe, Lock, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import defaultProjectImage from '@/assets/default-project-image.jpg';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, dialog is in edit mode pre-filled with project data */
  editProject?: EditableProject | null;
  onSaved?: () => void;
}

export interface EditableProject {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  technologies: string[];
  github_repo_url: string | null;
  external_links: Record<string, string> | null;
  project_type: string;
  visibility: string;
  is_paid: boolean;
  compensation_type: string | null;
  budget: string | null;
  currency: string;
  team_size: string;
  experience_level: string;
  duration: string;
  allow_applications: boolean;
  requires_approval: boolean;
  invite_emails: string[] | null;
  category: string | null;
  industry: string | null;
  launch_readiness: string | null;
}

const STEPS = [
  { id: 'basics', label: 'Basics' },
  { id: 'details', label: 'Details' },
  { id: 'links', label: 'Links & Tools' },
  { id: 'settings', label: 'Settings' },
];

function getInitialForm(project?: EditableProject | null) {
  if (project) {
    const ext = project.external_links || {};
    return {
      name: project.name,
      description: project.description,
      logo: null as File | null,
      technologies: project.technologies || [],
      githubUrl: project.github_repo_url || '',
      figmaUrl: ext.figma || '',
      slackUrl: ext.slack || '',
      discordUrl: ext.discord || '',
      linearUrl: ext.linear || '',
      otherToolUrl: ext.other || '',
      projectType: project.project_type,
      visibility: project.visibility,
      isPaid: project.is_paid,
      compensationType: project.compensation_type || 'fixed',
      budget: project.budget || '',
      currency: project.currency || 'USD',
      teamSize: project.team_size,
      experienceLevel: project.experience_level,
      duration: project.duration,
      allowApplications: project.allow_applications,
      requiresApproval: project.requires_approval,
      inviteEmails: project.invite_emails || [],
      category: project.category || '',
      industry: project.industry || '',
      launchReadiness: project.launch_readiness || 'concept',
    };
  }
  return {
    name: '',
    description: '',
    logo: null as File | null,
    technologies: [] as string[],
    githubUrl: '',
    figmaUrl: '',
    slackUrl: '',
    discordUrl: '',
    linearUrl: '',
    otherToolUrl: '',
    projectType: 'open-source',
    visibility: 'public',
    isPaid: false,
    compensationType: 'fixed',
    budget: '',
    currency: 'USD',
    teamSize: '1-3',
    experienceLevel: 'intermediate',
    duration: '1-3months',
    allowApplications: true,
    requiresApproval: true,
    inviteEmails: [] as string[],
    category: '',
    industry: '',
    launchReadiness: 'concept',
  };
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  editProject,
  onSaved,
}) => {
  const isEditMode = !!editProject;
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState(() => getInitialForm(editProject));
  const [currentTech, setCurrentTech] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(editProject?.logo_url || null);

  // Reset when dialog opens with new project
  React.useEffect(() => {
    if (open) {
      setFormData(getInitialForm(editProject));
      setLogoPreview(editProject?.logo_url || null);
      setStep(0);
    }
  }, [open, editProject]);

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const addTechnology = () => {
    if (currentTech.trim() && !formData.technologies.includes(currentTech.trim())) {
      set('technologies', [...formData.technologies, currentTech.trim()]);
      setCurrentTech('');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Max 2MB');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }
    set('logo', file);
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const buildExternalLinks = () => {
    const links: Record<string, string> = {};
    if (formData.figmaUrl.trim()) links.figma = formData.figmaUrl.trim();
    if (formData.slackUrl.trim()) links.slack = formData.slackUrl.trim();
    if (formData.discordUrl.trim()) links.discord = formData.discordUrl.trim();
    if (formData.linearUrl.trim()) links.linear = formData.linearUrl.trim();
    if (formData.otherToolUrl.trim()) links.other = formData.otherToolUrl.trim();
    return links;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      setStep(0);
      return;
    }
    setIsSubmitting(true);
    try {
      let logoUrl = editProject?.logo_url || null;
      if (formData.logo) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        const fileExt = formData.logo.name.split('.').pop()?.toLowerCase() || '';
        if (!allowedExtensions.includes(fileExt)) {
          toast.error('Invalid file type');
          setIsSubmitting(false);
          return;
        }
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: upErr } = await supabase.storage
          .from('project-logos')
          .upload(fileName, formData.logo);
        if (upErr) throw new Error(upErr.message);
        const {
          data: { publicUrl },
        } = supabase.storage.from('project-logos').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      const externalLinks = buildExternalLinks();
      const payload = {
        name: formData.name,
        description: formData.description,
        logo_url: logoUrl,
        technologies: formData.technologies,
        project_type: formData.projectType,
        visibility: formData.visibility,
        is_paid: formData.isPaid,
        compensation_type: formData.isPaid ? formData.compensationType : null,
        budget: formData.isPaid ? formData.budget : null,
        currency: formData.currency,
        team_size: formData.teamSize,
        experience_level: formData.experienceLevel,
        duration: formData.duration,
        allow_applications: formData.allowApplications,
        requires_approval: formData.requiresApproval,
        invite_emails: formData.inviteEmails,
        category: formData.category || null,
        industry: formData.industry || null,
        launch_readiness: formData.launchReadiness,
        github_repo_url: formData.githubUrl.trim() || null,
        external_links: Object.keys(externalLinks).length > 0 ? externalLinks : {},
      };

      if (isEditMode && editProject) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editProject.id);
        if (error) throw new Error(error.message);
        toast.success('Project updated!');
        onSaved?.();
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({ ...payload, creator_id: user.id })
          .select()
          .single();
        if (error) throw new Error(error.message);
        toast.success('Project created!');
        window.location.reload();
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (idx: number) => {
    if (idx === 0) return !!(formData.name.trim() && formData.description.trim());
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? 'Edit Project' : 'Create Project'}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setStep(i)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors',
                    step === i
                      ? 'bg-accent text-foreground'
                      : isStepComplete(i)
                        ? 'text-muted-foreground hover:text-foreground'
                        : 'text-muted-foreground/50'
                  )}
                >
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold border',
                      step === i
                        ? 'border-foreground text-foreground'
                        : isStepComplete(i)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground/50'
                    )}
                  >
                    {isStepComplete(i) && step !== i ? <Check className="h-2.5 w-2.5" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border/60" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Separator />

        {/* Form content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {step === 0 && (
            <>
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Project Name *</Label>
                <Input
                  placeholder="My Awesome Project"
                  value={formData.name}
                  onChange={e => set('name', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Description *</Label>
                <Textarea
                  placeholder="What does this project do?"
                  value={formData.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              {/* Logo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border border-border/50 overflow-hidden bg-muted shrink-0">
                    <img
                      src={logoPreview || defaultProjectImage}
                      alt="Logo"
                      className={cn('w-full h-full object-cover', !logoPreview && 'opacity-50')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="h-3 w-3" /> Upload
                    </Button>
                    {formData.logo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => {
                          set('logo', null);
                          setLogoPreview(editProject?.logo_url || null);
                        }}
                      >
                        <X className="h-3 w-3" /> Remove
                      </Button>
                    )}
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Technologies *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. React, Python"
                    value={currentTech}
                    onChange={e => setCurrentTech(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    className="h-8 text-xs"
                  />
                  <Button
                    onClick={addTechnology}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.technologies.map(tech => (
                      <Badge key={tech} variant="secondary" className="text-[10px] gap-1 pr-1">
                        {tech}
                        <X
                          className="h-2.5 w-2.5 cursor-pointer"
                          onClick={() =>
                            set(
                              'technologies',
                              formData.technologies.filter(t => t !== tech)
                            )
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Category & Industry */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Category</Label>
                  <Select value={formData.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'web-app',
                        'mobile-app',
                        'desktop-app',
                        'api',
                        'library',
                        'tool',
                        'game',
                        'other',
                      ].map(v => (
                        <SelectItem key={v} value={v} className="text-xs">
                          {v.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Industry</Label>
                  <Select value={formData.industry} onValueChange={v => set('industry', v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'fintech',
                        'healthcare',
                        'education',
                        'ecommerce',
                        'social',
                        'productivity',
                        'entertainment',
                        'other',
                      ].map(v => (
                        <SelectItem key={v} value={v} className="text-xs capitalize">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              {/* Type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Project Type</Label>
                <RadioGroup
                  value={formData.projectType}
                  onValueChange={v => set('projectType', v)}
                  className="space-y-1.5"
                >
                  {[
                    {
                      value: 'open-source',
                      label: 'Open Source',
                      desc: 'Public repo, community contributions',
                      icon: Globe,
                    },
                    {
                      value: 'private',
                      label: 'Private',
                      desc: 'Closed source, invite-only',
                      icon: Lock,
                    },
                    {
                      value: 'hybrid',
                      label: 'Hybrid',
                      desc: 'Mix of open and closed components',
                      icon: Globe,
                    },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5 cursor-pointer transition-colors',
                        formData.projectType === opt.value && 'border-primary/50 bg-accent/50'
                      )}
                    >
                      <RadioGroupItem value={opt.value} id={opt.value} />
                      <opt.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{opt.label}</div>
                        <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Team settings */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Team Size</Label>
                  <Select value={formData.teamSize} onValueChange={v => set('teamSize', v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['1-3', '4-6', '7-10', '10+'].map(v => (
                        <SelectItem key={v} value={v} className="text-xs">
                          {v} people
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Level</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={v => set('experienceLevel', v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['beginner', 'intermediate', 'advanced', 'expert'].map(v => (
                        <SelectItem key={v} value={v} className="text-xs capitalize">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Duration</Label>
                  <Select value={formData.duration} onValueChange={v => set('duration', v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        ['1week', '1 week'],
                        ['1month', '1 month'],
                        ['1-3months', '1-3 months'],
                        ['3-6months', '3-6 months'],
                        ['6months+', '6+ months'],
                      ].map(([v, l]) => (
                        <SelectItem key={v} value={v} className="text-xs">
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Compensation */}
              <Separator className="opacity-50" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Paid Project</Label>
                    <p className="text-[10px] text-muted-foreground">
                      Contributors will be compensated
                    </p>
                  </div>
                  <Switch checked={formData.isPaid} onCheckedChange={v => set('isPaid', v)} />
                </div>
                {formData.isPaid && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Type</Label>
                      <Select
                        value={formData.compensationType}
                        onValueChange={v => set('compensationType', v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['fixed', 'hourly', 'equity', 'hybrid'].map(v => (
                            <SelectItem key={v} value={v} className="text-xs capitalize">
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Budget</Label>
                      <Input
                        value={formData.budget}
                        onChange={e => set('budget', e.target.value)}
                        placeholder="5000"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Currency</Label>
                      <Select value={formData.currency} onValueChange={v => set('currency', v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['USD', 'EUR', 'GBP', 'KES'].map(v => (
                            <SelectItem key={v} value={v} className="text-xs">
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* GitHub */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">GitHub Repository URL</Label>
                <Input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={formData.githubUrl}
                  onChange={e => set('githubUrl', e.target.value)}
                  className="h-9 text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  This enables live stats, contributors, and issues on your project page.
                </p>
              </div>

              <Separator className="opacity-50" />

              {/* External tool links */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">External Tools</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Add links to your project's tools
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ['figmaUrl', 'Figma', 'https://figma.com/file/...'],
                      ['slackUrl', 'Slack', 'https://workspace.slack.com/...'],
                      ['discordUrl', 'Discord', 'https://discord.gg/...'],
                      ['linearUrl', 'Linear / ClickUp', 'https://linear.app/...'],
                    ] as const
                  ).map(([key, label, placeholder]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{label}</Label>
                      <Input
                        type="url"
                        placeholder={placeholder}
                        value={formData[key]}
                        onChange={e => set(key, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Other</Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={formData.otherToolUrl}
                    onChange={e => set('otherToolUrl', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Visibility */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Visibility</Label>
                <RadioGroup
                  value={formData.visibility}
                  onValueChange={v => set('visibility', v)}
                  className="space-y-1.5"
                >
                  {[
                    { value: 'public', label: 'Public', desc: 'Anyone can discover and apply' },
                    {
                      value: 'unlisted',
                      label: 'Unlisted',
                      desc: 'Only accessible via direct link',
                    },
                    {
                      value: 'invite-only',
                      label: 'Invite Only',
                      desc: 'Requires invitation to join',
                    },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2 cursor-pointer transition-colors',
                        formData.visibility === opt.value && 'border-primary/50 bg-accent/50'
                      )}
                    >
                      <RadioGroupItem value={opt.value} id={`vis-${opt.value}`} />
                      <div>
                        <div className="text-xs font-medium">{opt.label}</div>
                        <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Separator className="opacity-50" />

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Allow Applications</Label>
                    <p className="text-[10px] text-muted-foreground">Let people apply to join</p>
                  </div>
                  <Switch
                    checked={formData.allowApplications}
                    onCheckedChange={v => set('allowApplications', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">Require Approval</Label>
                    <p className="text-[10px] text-muted-foreground">
                      Manually approve new contributors
                    </p>
                  </div>
                  <Switch
                    checked={formData.requiresApproval}
                    onCheckedChange={v => set('requiresApproval', v)}
                  />
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Invite emails */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Invite by Email</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="colleague@example.com"
                    value={currentEmail}
                    onChange={e => setCurrentEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (
                          currentEmail.trim() &&
                          !formData.inviteEmails.includes(currentEmail.trim())
                        ) {
                          set('inviteEmails', [...formData.inviteEmails, currentEmail.trim()]);
                          setCurrentEmail('');
                        }
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={() => {
                      if (
                        currentEmail.trim() &&
                        !formData.inviteEmails.includes(currentEmail.trim())
                      ) {
                        set('inviteEmails', [...formData.inviteEmails, currentEmail.trim()]);
                        setCurrentEmail('');
                      }
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {formData.inviteEmails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.inviteEmails.map(email => (
                      <Badge key={email} variant="secondary" className="text-[10px] gap-1 pr-1">
                        {email}
                        <X
                          className="h-2.5 w-2.5 cursor-pointer"
                          onClick={() =>
                            set(
                              'inviteEmails',
                              formData.inviteEmails.filter(e => e !== email)
                            )
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="h-3 w-3" /> Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !isStepComplete(0)}
              >
                Next <ChevronRight className="h-3 w-3" />
              </Button>
            ) : (
              <Button size="sm" className="text-xs" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? 'Saving…'
                    : 'Creating…'
                  : isEditMode
                    ? 'Save Changes'
                    : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
