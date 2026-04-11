import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TopNavLayout } from '@/components/TopNavLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import {
  Plus,
  Trash2,
  ArrowLeft,
  DollarSign,
  Clock,
  FileText,
  Github,
  Globe,
  Send,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  User,
  Calendar,
  Loader2,
} from 'lucide-react';

interface Milestone {
  title: string;
  description: string;
  duration: string;
  amount: number | '';
}

const SubmitProposal = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [paymentType, setPaymentType] = useState<'fixed' | 'hourly'>('fixed');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [totalDuration, setTotalDuration] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [availability, setAvailability] = useState<'full-time' | 'part-time' | 'weekends'>(
    'full-time'
  );
  const [startDate, setStartDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', description: '', duration: '1 week', amount: '' },
  ]);

  const totalAmount = useMemo(() => {
    if (paymentType === 'hourly') return hourlyRate === '' ? 0 : Number(hourlyRate);
    return milestones.reduce((sum, m) => sum + (m.amount === '' ? 0 : Number(m.amount)), 0);
  }, [milestones, paymentType, hourlyRate]);

  const canonicalHref = useMemo(
    () => `${window.location.origin}/submit-proposal/${projectId ?? ''}`,
    [projectId]
  );

  useEffect(() => {
    document.title = 'Submit Proposal | Colabs';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content =
      `Submit your proposal for a gig on Colabs — the developer collaboration platform.`.slice(
        0,
        155
      );
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;
  }, [projectId, canonicalHref]);

  const handleAddMilestone = () =>
    setMilestones(m => [...m, { title: '', description: '', duration: '', amount: '' }]);
  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(m => m.filter((_, i) => i !== index));
  };
  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    setMilestones(arr => arr.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const isValid = useMemo(() => {
    if (!coverLetter.trim()) return false;
    if (!githubUrl.trim()) return false;
    if (paymentType === 'fixed' && milestones.every(m => !m.title.trim())) return false;
    if (paymentType === 'hourly' && hourlyRate === '') return false;
    return true;
  }, [coverLetter, githubUrl, paymentType, milestones, hourlyRate]);

  const handleSubmit = async () => {
    if (!user || !projectId) return;

    if (!isValid) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      let resume_path: string | null = null;
      if (resumeFile) {
        const allowedResumeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedResumeTypes.includes(resumeFile.type)) {
          toast({
            title: 'Invalid file type',
            description: 'Please upload a PDF or Word document.',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }
        const allowedExts = ['pdf', 'doc', 'docx'];
        const fileExt = resumeFile.name.split('.').pop()?.toLowerCase() || '';
        if (!allowedExts.includes(fileExt)) {
          toast({
            title: 'Invalid file extension',
            description: 'Allowed: PDF, DOC, DOCX.',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }
        if (resumeFile.size > 10 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: 'Maximum file size is 10MB.',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile, { contentType: resumeFile.type, upsert: false });
        if (uploadError) throw uploadError;
        resume_path = uploadData?.path ?? filePath;
      }

      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals' as any)
        .insert({
          user_id: user.id,
          project_id: String(projectId),
          payment_type: paymentType,
          total_duration: totalDuration || null,
          total_amount: totalAmount === 0 ? null : totalAmount,
          resume_path: resume_path ?? '',
          cover_letter: coverLetter || null,
          portfolio_url: portfolioUrl || '',
          github_url: githubUrl || '',
        })
        .select('id')
        .maybeSingle();

      if (proposalError) throw proposalError;
      const proposalId = (proposalData as any)?.id;
      if (!proposalId) throw new Error('Failed to create proposal');

      if (paymentType === 'fixed') {
        const cleaned = milestones
          .map((m, idx) => ({
            proposal_id: proposalId,
            title: m.title || `Milestone ${idx + 1}`,
            duration: m.duration || '',
            amount: m.amount === '' ? 0 : Number(m.amount),
            order_index: idx,
          }))
          .filter(m => m.title.trim().length > 0);

        if (cleaned.length > 0) {
          const { error: msError } = await supabase
            .from('proposal_milestones' as any)
            .insert(cleaned);
          if (msError) throw msError;
        }
      }

      toast({
        title: 'Proposal submitted!',
        description: "You'll be notified when the client responds.",
      });
      navigate('/proposals');
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err.message ?? String(err),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <TopNavLayout title="Submit Proposal">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Submit Proposal</h1>
              <p className="text-[11px] text-muted-foreground">Gig #{projectId}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* ===== SECTION 1: APPROACH & COVER LETTER ===== */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Your Approach</h2>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-2">
                Explain how you'd tackle this gig and why you're the right fit
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="coverLetter" className="text-xs text-muted-foreground">
                  Cover letter <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="coverLetter"
                  rows={6}
                  placeholder="Describe your approach to this project, relevant experience, and what makes you uniquely qualified..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  className="bg-transparent border-border/40 text-sm resize-none focus:border-primary/50"
                  maxLength={2000}
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {coverLetter.length}/2000
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="relevantExperience" className="text-xs text-muted-foreground">
                  Relevant experience
                </Label>
                <Textarea
                  id="relevantExperience"
                  rows={3}
                  placeholder="List specific projects or roles where you've done similar work..."
                  value={relevantExperience}
                  onChange={e => setRelevantExperience(e.target.value)}
                  className="bg-transparent border-border/40 text-sm resize-none focus:border-primary/50"
                  maxLength={1000}
                />
              </div>
            </section>

            <Separator className="border-border/30" />

            {/* ===== SECTION 2: PRICING ===== */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Pricing</h2>
              </div>

              {/* Payment type toggle */}
              <div className="flex gap-2">
                {(['fixed', 'hourly'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setPaymentType(type)}
                    className={`text-[12px] px-3 py-1.5 rounded-md border transition-colors font-medium ${
                      paymentType === type
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
                    }`}
                  >
                    {type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </button>
                ))}
              </div>

              {paymentType === 'hourly' ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hourlyRate" className="text-xs text-muted-foreground">
                      Hourly rate (USD) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="hourlyRate"
                        type="number"
                        min={0}
                        placeholder="75"
                        value={hourlyRate}
                        onChange={e =>
                          setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="pl-8 bg-transparent border-border/40 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="estimatedHours" className="text-xs text-muted-foreground">
                      Estimated duration
                    </Label>
                    <Input
                      id="estimatedHours"
                      placeholder="e.g. 40 hours over 2 weeks"
                      value={totalDuration}
                      onChange={e => setTotalDuration(e.target.value)}
                      className="bg-transparent border-border/40 text-sm"
                    />
                  </div>
                </div>
              ) : (
                /* Milestones */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Milestones
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground"
                      onClick={handleAddMilestone}
                    >
                      <Plus className="h-3 w-3" /> Add milestone
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-border/40 bg-card/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
                            <span className="text-[11px] font-medium text-muted-foreground">
                              Milestone {idx + 1}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveMilestone(idx)}
                            disabled={milestones.length <= 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="space-y-1.5">
                          <Input
                            placeholder="Milestone title (e.g. Design & Setup)"
                            value={m.title}
                            onChange={e => updateMilestone(idx, 'title', e.target.value)}
                            className="bg-transparent border-border/40 text-sm h-8"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Textarea
                            placeholder="What will be delivered in this milestone..."
                            value={m.description}
                            onChange={e => updateMilestone(idx, 'description', e.target.value)}
                            className="bg-transparent border-border/40 text-sm resize-none h-16"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                              placeholder="Duration (e.g. 1 week)"
                              value={m.duration}
                              onChange={e => updateMilestone(idx, 'duration', e.target.value)}
                              className="pl-8 bg-transparent border-border/40 text-sm h-8"
                            />
                          </div>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                              type="number"
                              min={0}
                              placeholder="Amount"
                              value={m.amount}
                              onChange={e =>
                                updateMilestone(
                                  idx,
                                  'amount',
                                  e.target.value === '' ? '' : Number(e.target.value)
                                )
                              }
                              className="pl-8 bg-transparent border-border/40 text-sm h-8"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total summary */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <span className="text-xs text-muted-foreground">Total project cost</span>
                    <span className="text-sm font-semibold text-primary">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="totalDuration" className="text-xs text-muted-foreground">
                      Total estimated duration
                    </Label>
                    <Input
                      id="totalDuration"
                      placeholder="e.g. 4 weeks"
                      value={totalDuration}
                      onChange={e => setTotalDuration(e.target.value)}
                      className="bg-transparent border-border/40 text-sm"
                    />
                  </div>
                </div>
              )}
            </section>

            <Separator className="border-border/30" />

            {/* ===== SECTION 3: AVAILABILITY ===== */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Availability</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Availability</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(['full-time', 'part-time', 'weekends'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAvailability(opt)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                          availability === opt
                            ? 'bg-primary/15 text-primary border-primary/30'
                            : 'bg-transparent text-muted-foreground border-border/40 hover:border-border'
                        }`}
                      >
                        {opt === 'full-time'
                          ? 'Full-time'
                          : opt === 'part-time'
                            ? 'Part-time'
                            : 'Weekends only'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                    Earliest start date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-transparent border-border/40 text-sm"
                  />
                </div>
              </div>
            </section>

            <Separator className="border-border/30" />

            {/* ===== SECTION 4: LINKS & FILES ===== */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Profile & Portfolio</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="github" className="text-xs text-muted-foreground">
                    GitHub profile <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Github className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="github"
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                      className="pl-8 bg-transparent border-border/40 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="portfolio" className="text-xs text-muted-foreground">
                    Portfolio / website
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="portfolio"
                      placeholder="https://yoursite.com"
                      value={portfolioUrl}
                      onChange={e => setPortfolioUrl(e.target.value)}
                      className="pl-8 bg-transparent border-border/40 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resume" className="text-xs text-muted-foreground">
                  Resume (PDF, max 5MB)
                </Label>
                <div className="relative">
                  <Input
                    id="resume"
                    type="file"
                    accept="application/pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 5 * 1024 * 1024) {
                        toast({
                          title: 'File too large',
                          description: 'Resume must be under 5MB.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      setResumeFile(file ?? null);
                    }}
                    className="bg-transparent border-border/40 text-sm file:bg-accent file:text-foreground file:border-0 file:rounded file:text-xs file:mr-3"
                  />
                </div>
                {resumeFile && (
                  <p className="text-[10px] text-primary flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {resumeFile.name}
                  </p>
                )}
              </div>
            </section>

            <Separator className="border-border/30" />

            {/* ===== SUBMIT ===== */}
            <div className="flex items-center justify-between pt-2 pb-8">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>
                  Fields marked with <span className="text-destructive">*</span> are required
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={handleSubmit}
                  disabled={submitting || !isValid}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Submit Proposal
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TopNavLayout>
    </AuthGuard>
  );
};

export default SubmitProposal;
