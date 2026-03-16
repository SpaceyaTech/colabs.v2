import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ExploreGigCard } from "@/components/ExploreGigCard";
import { useGigById, useGigs, gigRowToExploreGig } from "@/hooks/useGigs";
import {
  ArrowLeft, Clock, DollarSign, MapPin, Star, Bookmark, BookmarkCheck,
  Send, Flag, Calendar, MessageSquare, Building2, Users, Zap,
  CheckCircle2, Shield, Globe, Briefcase, ExternalLink, Share2, Copy,
  ChevronRight
} from "lucide-react";

const difficultyColor: Record<string, string> = {
  "Entry level": "bg-primary/15 text-primary border-primary/20",
  "Intermediate": "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
  "Expert": "bg-destructive/15 text-destructive border-destructive/20",
};

const GigDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: gig, isLoading } = useGigById(id);
  const { data: allGigRows } = useGigs();

  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("colabs-saved-gigs") || "[]");
      return saved.includes(id);
    } catch { return false; }
  });

  const handleSave = useCallback(() => {
    if (!user) { navigate("/sign-in"); return; }
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("colabs-saved-gigs") || "[]");
      const next = isSaved ? saved.filter(s => s !== id) : [...saved, id!];
      localStorage.setItem("colabs-saved-gigs", JSON.stringify(next));
      setIsSaved(!isSaved);
      toast({ title: isSaved ? "Removed from saved" : "Saved", description: isSaved ? "Gig removed from your list" : "Gig saved for later" });
    } catch {}
  }, [isSaved, id, user, navigate, toast]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied", description: "Gig URL copied to clipboard" });
  }, [toast]);

  const similarGigs = useMemo(() => {
    if (!gig || !allGigRows) return [];
    return allGigRows
      .filter(g => g.id !== gig.id && g.category === gig.category)
      .slice(0, 3)
      .map(gigRowToExploreGig);
  }, [gig, allGigRows]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="lg:w-72">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!gig) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Briefcase className="h-10 w-10 mx-auto mb-4 text-muted-foreground/30" />
          <h1 className="text-lg font-semibold mb-2">Gig not found</h1>
          <p className="text-sm text-muted-foreground mb-4">This gig may have been removed or doesn't exist.</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Marketplace
          </Button>
        </div>
      </AppLayout>
    );
  }

  const postedAt = new Date(gig.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <button onClick={() => navigate("/marketplace")} className="hover:text-foreground transition-colors">Marketplace</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => navigate("/marketplace")} className="hover:text-foreground transition-colors">Gigs</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-[200px]">{gig.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {gig.featured && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium bg-primary/15 text-primary border-primary/20 flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5" /> Featured
                  </span>
                )}
                {gig.is_urgent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium bg-destructive/15 text-destructive border-destructive/20 flex items-center gap-0.5">
                    <Zap className="h-2.5 w-2.5" /> Urgent
                  </span>
                )}
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${difficultyColor[gig.difficulty] || ""}`}>
                  {gig.difficulty}
                </span>
                {gig.category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground">
                    {gig.category}
                  </span>
                )}
              </div>

              <h1 className="text-xl font-semibold text-foreground leading-tight">{gig.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <DollarSign className="h-4 w-4 text-primary" />{gig.budget}
                </span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{gig.duration}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{gig.location}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Posted {postedAt}</span>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{gig.proposals_count} proposals</span>
              </div>
            </div>

            <Separator className="bg-border/40" />

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">About this gig</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {gig.full_description}
              </div>
            </section>

            {gig.requirements.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">Requirements</h2>
                <ul className="space-y-1.5">
                  {gig.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {gig.deliverables.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">Deliverables</h2>
                <ul className="space-y-1.5">
                  {gig.deliverables.map((del, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="h-3.5 w-3.5 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-[8px] text-primary font-bold mt-0.5 shrink-0">
                        {i + 1}
                      </span>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Skills & Technologies</h2>
              <div className="flex flex-wrap gap-1.5">
                {gig.technologies.map(tech => (
                  <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                ))}
              </div>
            </section>

            <Separator className="bg-border/40" />

            {/* About the client */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">About the client</h2>
              <div className="p-4 rounded-lg border border-border/40 bg-card/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">{gig.company}</span>
                        {gig.company_verified && <Shield className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      {gig.company_rating && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          <span>{gig.company_rating} ({gig.company_review_count} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Member since", value: gig.client_member_since || "N/A" },
                    { label: "Total spent", value: gig.client_total_spent || "N/A" },
                    { label: "Hire rate", value: gig.client_hire_rate ? `${gig.client_hire_rate}%` : "N/A" },
                    { label: "Open jobs", value: gig.client_open_jobs?.toString() || "N/A" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Similar gigs */}
            {similarGigs.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Similar gigs</h2>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => navigate("/marketplace")}>
                    View all →
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {similarGigs.map(g => (
                    <ExploreGigCard key={g.id} gig={g} showApply={false} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="lg:w-72 shrink-0 space-y-3">
            <div className="lg:sticky lg:top-20 space-y-3">
              <div className="p-4 rounded-lg border border-border/40 bg-card/50 space-y-3">
                <div className="text-center space-y-1">
                  <p className="text-xl font-bold text-foreground">{gig.budget}</p>
                  <p className="text-[11px] text-muted-foreground">{gig.duration} · {gig.location}</p>
                </div>

                <Button
                  className="w-full gap-1.5 text-sm"
                  onClick={() => {
                    if (!user) { navigate("/sign-in"); return; }
                    navigate(`/submit-proposal/${gig.id}`);
                  }}
                >
                  <Send className="h-3.5 w-3.5" /> Submit Proposal
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-1.5 text-xs" size="sm" onClick={handleSave}>
                    {isSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-1.5 text-xs" size="sm" onClick={handleShare}>
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/40 bg-card/50 space-y-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Project Details</p>
                {[
                  { icon: DollarSign, label: "Budget", value: gig.budget },
                  { icon: Clock, label: "Duration", value: gig.duration },
                  { icon: Briefcase, label: "Experience", value: gig.difficulty },
                  { icon: MapPin, label: "Location", value: gig.location },
                  { icon: Users, label: "Proposals", value: `${gig.proposals_count}` },
                  { icon: Calendar, label: "Posted", value: postedAt },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </span>
                    <span className="font-medium text-foreground text-xs">{value}</span>
                  </div>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="w-full gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                <Flag className="h-3.5 w-3.5" /> Report this gig
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default GigDetails;
