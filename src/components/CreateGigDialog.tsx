import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { GigRow } from '@/hooks/useGigs';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  DollarSign,
  Clock,
  Briefcase,
  Loader2,
  X,
  MapPin,
  Building2,
  Pencil,
} from 'lucide-react';

const gigSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters'),
  company: z
    .string()
    .trim()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be under 100 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Short description is required')
    .max(500, 'Description must be under 500 characters'),
  fullDescription: z
    .string()
    .trim()
    .max(5000, 'Full description must be under 5000 characters')
    .optional()
    .default(''),
  budget: z
    .string()
    .trim()
    .min(1, 'Budget range is required')
    .max(100, 'Budget must be under 100 characters'),
  budgetValue: z.union([
    z.literal(''),
    z.number().min(0, 'Budget value must be positive').max(1000000, 'Budget value too large'),
  ]),
  duration: z.string().trim().max(100).optional().default(''),
  location: z.string().trim().max(100).optional().default('Remote'),
  difficulty: z.string(),
  category: z.string(),
  isUrgent: z.boolean(),
  technologies: z.array(z.string().max(50)).max(20, 'Maximum 20 technologies'),
  requirements: z.array(z.string().max(500)),
  deliverables: z.array(z.string().max(500)),
});

type FieldErrors = Partial<Record<string, string>>;

interface CreateGigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  editGig?: GigRow | null;
}

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Backend',
  'DevOps',
  'UI/UX Design',
  'Data Science',
  'Machine Learning',
  'Blockchain',
];

const DIFFICULTIES = ['Entry level', 'Intermediate', 'Expert'];

export function CreateGigDialog({ open, onOpenChange, onCreated, editGig }: CreateGigDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editGig;

  // Form state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [budgetValue, setBudgetValue] = useState<number | ''>('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('Remote');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [category, setCategory] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const [errors, setErrors] = useState<FieldErrors>({});
  useEffect(() => {
    if (editGig && open) {
      setTitle(editGig.title);
      setCompany(editGig.company);
      setDescription(editGig.description);
      setFullDescription(editGig.full_description);
      setBudget(editGig.budget);
      setBudgetValue(editGig.budget_value || '');
      setDuration(editGig.duration);
      setLocation(editGig.location);
      setDifficulty(editGig.difficulty);
      setCategory(editGig.category ?? '');
      setIsUrgent(editGig.is_urgent);
      setTechnologies(editGig.technologies ?? []);
      setRequirements(editGig.requirements?.length ? editGig.requirements : ['']);
      setDeliverables(editGig.deliverables?.length ? editGig.deliverables : ['']);
      setTechInput('');
    } else if (!editGig && open) {
      resetForm();
    }
  }, [editGig, open]);

  const addTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setTechInput('');
    }
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setDescription('');
    setFullDescription('');
    setBudget('');
    setBudgetValue('');
    setDuration('');
    setLocation('Remote');
    setDifficulty('Intermediate');
    setCategory('');
    setIsUrgent(false);
    setTechInput('');
    setTechnologies([]);
    setRequirements(['']);
    setDeliverables(['']);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!user) return;

    const result = gigSchema.safeParse({
      title,
      company,
      description,
      fullDescription,
      budget,
      budgetValue,
      duration,
      location,
      difficulty,
      category,
      isUrgent,
      technologies,
      requirements,
      deliverables,
    });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast({
        title: 'Validation error',
        description: 'Please fix the highlighted fields.',
        variant: 'destructive',
      });
      return;
    }

    setErrors({});

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      full_description: fullDescription.trim() || description.trim(),
      budget: budget.trim(),
      budget_value: budgetValue === '' ? 0 : Number(budgetValue),
      duration: duration.trim(),
      location: location.trim(),
      difficulty,
      category: category || null,
      is_urgent: isUrgent,
      technologies,
      requirements: requirements.filter((r) => r.trim()),
      deliverables: deliverables.filter((d) => d.trim()),
    };

    let error;

    if (isEditing) {
      ({ error } = await supabase.from('gigs').update(payload).eq('id', editGig!.id));
    } else {
      ({ error } = await supabase.from('gigs').insert({
        ...payload,
        creator_id: user.id,
        status: 'active',
      }));
    }

    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: isEditing ? 'Gig updated!' : 'Gig posted!',
      description: isEditing ? 'Your changes have been saved.' : 'Your gig is now live.',
    });
    resetForm();
    onOpenChange(false);
    onCreated?.();
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {isEditing ? (
              <Pencil className="h-4 w-4 text-primary" />
            ) : (
              <Briefcase className="h-4 w-4 text-primary" />
            )}
            {isEditing ? 'Edit Gig' : 'Post a New Gig'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Basic Information
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Gig Title *</Label>
              <Input
                placeholder="e.g. Senior React Developer for E-commerce Platform"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={errors.title ? 'border-destructive' : ''}
              />
              {fieldError('title')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Company Name *
                </Label>
                <Input
                  placeholder="Your company name"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    setErrors((prev) => ({ ...prev, company: undefined }));
                  }}
                  className={errors.company ? 'border-destructive' : ''}
                />
                {fieldError('company')}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </Label>
                <Input
                  placeholder="Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Short Description *</Label>
              <Textarea
                placeholder="Brief summary of the gig (shown in cards)"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                className={`min-h-[60px] ${errors.description ? 'border-destructive' : ''}`}
              />
              {fieldError('description')}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Description</Label>
              <Textarea
                placeholder="Detailed description with project context, goals, etc."
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </section>

          <Separator />

          {/* Budget & Duration */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budget & Timeline
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Budget Range *
                </Label>
                <Input
                  placeholder="$3,000 - $5,000"
                  value={budget}
                  onChange={(e) => {
                    setBudget(e.target.value);
                    setErrors((prev) => ({ ...prev, budget: undefined }));
                  }}
                  className={errors.budget ? 'border-destructive' : ''}
                />
                {fieldError('budget')}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Budget Value ($)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={budgetValue}
                  onChange={(e) => {
                    setBudgetValue(e.target.value === '' ? '' : Number(e.target.value));
                    setErrors((prev) => ({ ...prev, budgetValue: undefined }));
                  }}
                  className={errors.budgetValue ? 'border-destructive' : ''}
                />
                {fieldError('budgetValue')}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration
                </Label>
                <Input
                  placeholder="2-4 weeks"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Category & Difficulty */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Classification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Difficulty</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-muted-foreground">Mark as urgent</span>
            </label>
          </section>

          <Separator />

          {/* Technologies */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Technologies
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Add a technology..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTech}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {technologies.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs gap-1">
                    {t}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setTechnologies(technologies.filter((x) => x !== t))}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Requirements */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Requirements
            </h3>
            {requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Requirement ${i + 1}`}
                  value={req}
                  onChange={(e) => {
                    const copy = [...requirements];
                    copy[i] = e.target.value;
                    setRequirements(copy);
                  }}
                  className="flex-1"
                />
                {requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                    onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRequirements([...requirements, ''])}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Requirement
            </Button>
          </section>

          <Separator />

          {/* Deliverables */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Deliverables
            </h3>
            {deliverables.map((del, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Deliverable ${i + 1}`}
                  value={del}
                  onChange={(e) => {
                    const copy = [...deliverables];
                    copy[i] = e.target.value;
                    setDeliverables(copy);
                  }}
                  className="flex-1"
                />
                {deliverables.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeliverables(deliverables.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeliverables([...deliverables, ''])}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Deliverable
            </Button>
          </section>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Saving...' : 'Posting...'}
                </>
              ) : isEditing ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post Gig
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
