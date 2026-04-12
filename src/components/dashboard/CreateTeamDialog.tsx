import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Users, Mail, FolderGit2, Loader2 } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const { user } = useAuth();
  const { createTeam } = useTeams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { data: projects = [] } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, technologies')
        .eq('creator_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && open,
  });

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !emails.includes(trimmed)) {
      setEmails(prev => [...prev, trimmed]);
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => setEmails(prev => prev.filter(e => e !== email));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const toggleProject = (id: string) => {
    setSelectedProjects(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  };

  const resetAndClose = () => {
    setName('');
    setDescription('');
    setEmailInput('');
    setEmails([]);
    setSelectedProjects([]);
    setStep(1);
    onOpenChange(false);
  };

  const canProceedStep1 = name.trim().length >= 2;

  const handleCreate = () => {
    createTeam.mutate(
      { name: name.trim(), description: description.trim(), emails, projectIds: selectedProjects },
      {
        onSuccess: () => {
          toast.success('Team created!');
          resetAndClose();
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to create team');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
          <DialogTitle className="text-base">Create Team</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === 1 && 'Name your team and add a short description.'}
            {step === 2 && 'Invite members by email. You can add more later.'}
            {step === 3 && 'Select projects this team will track.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 px-5 pt-3">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        <div className="px-5 py-4 space-y-4 min-h-[220px]">
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="team-name" className="text-xs font-medium">
                  Team name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="team-name"
                  placeholder="e.g. Product Engineering"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={60}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team-desc" className="text-xs font-medium">
                  Description
                </Label>
                <Textarea
                  id="team-desc"
                  placeholder="What does this team work on?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="resize-none text-sm"
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {description.length}/200
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <Label
                  htmlFor="invite-email"
                  className="text-xs font-medium flex items-center gap-1.5"
                >
                  <Mail className="h-3 w-3" /> Invite by email
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-email"
                    placeholder="name@company.com"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    type="email"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addEmail}
                    disabled={!emailInput.trim()}
                    className="shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Press Enter or comma to add</p>
              </div>
              {emails.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {emails.map(email => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="text-xs pl-2 pr-1 py-0.5 gap-1 font-normal"
                    >
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        className="hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-lg flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No members added yet</p>
                  <p className="text-[10px] text-muted-foreground">
                    You can skip this and add later
                  </p>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <FolderGit2 className="h-3 w-3" /> Projects to track
              </Label>
              {projects.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  {projects.map((project, i) => (
                    <label
                      key={project.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors ${i < projects.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => toggleProject(project.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{project.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(project.technologies || []).join(', ')}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-lg flex flex-col items-center justify-center py-8 text-center">
                  <FolderGit2 className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No projects found</p>
                  <p className="text-[10px] text-muted-foreground">
                    Create projects first, then link them here
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (step === 1 ? resetAndClose() : setStep(s => (s - 1) as 1 | 2 | 3))}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex items-center gap-2">
            {step < 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
                disabled={step === 1 && !canProceedStep1}
              >
                Skip
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => (step < 3 ? setStep(s => (s + 1) as 1 | 2 | 3) : handleCreate())}
              disabled={(step === 1 && !canProceedStep1) || (step === 3 && createTeam.isPending)}
            >
              {step < 3 ? (
                'Continue'
              ) : createTeam.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Creating...
                </>
              ) : (
                'Create Team'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
