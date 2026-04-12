import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExploreGig } from '@/components/ExploreGigCard';

export interface GigRow {
  id: string;
  creator_id: string;
  title: string;
  company: string;
  company_logo: string | null;
  company_verified: boolean;
  company_rating: number | null;
  company_review_count: number | null;
  budget: string;
  budget_value: number;
  duration: string;
  location: string;
  difficulty: string;
  category: string | null;
  description: string;
  full_description: string;
  requirements: string[];
  deliverables: string[];
  technologies: string[];
  proposals_count: number;
  is_urgent: boolean;
  featured: boolean;
  status: string;
  client_member_since: string | null;
  client_total_spent: string | null;
  client_hire_rate: number | null;
  client_open_jobs: number | null;
  created_at: string;
  updated_at: string;
}

export function gigRowToExploreGig(g: GigRow): ExploreGig {
  return {
    id: g.id,
    title: g.title,
    company: g.company,
    companyLogo: g.company_logo ?? undefined,
    companyVerified: g.company_verified,
    companyRating: g.company_rating ?? undefined,
    companyReviewCount: g.company_review_count ?? undefined,
    budget: g.budget,
    budgetValue: g.budget_value,
    duration: g.duration,
    postedAt: formatPostedAt(g.created_at),
    technologies: g.technologies,
    description: g.description,
    location: g.location,
    proposals: g.proposals_count,
    difficulty: g.difficulty as ExploreGig['difficulty'],
    category: g.category ?? undefined,
    isUrgent: g.is_urgent,
    featured: g.featured,
  };
}

function formatPostedAt(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function useGigs() {
  return useQuery({
    queryKey: ['gigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs' as any)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as GigRow[]) ?? [];
    },
  });
}

export function useMyGigs(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-gigs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('gigs' as any)
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as GigRow[]) ?? [];
    },
    enabled: !!userId,
  });
}

export function useGigById(id: string | undefined) {
  return useQuery({
    queryKey: ['gig', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('gigs' as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as GigRow) ?? null;
    },
    enabled: !!id,
  });
}
