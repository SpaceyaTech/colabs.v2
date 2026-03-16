import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { UnifiedIssue } from '@/components/issues/IssueSidePanel';

export interface ClaimedIssue {
  id: string;
  user_id: string;
  issue_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_name: string;
  assignee_avatar: string;
  repo_name: string;
  repo_owner: string;
  repo_full_name: string;
  labels: string[];
  category: string | null;
  comments: number;
  is_good_first_issue: boolean;
  html_url: string | null;
  created_at: string;
  claimed_at: string;
}

export const useClaimedIssues = () => {
  const { user } = useAuth();
  const [claimedIssues, setClaimedIssues] = useState<ClaimedIssue[]>([]);
  const [claimedIssueIds, setClaimedIssueIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchClaimed = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('claimed_issues')
      .select('*')
      .eq('user_id', user.id)
      .order('claimed_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch claimed issues:', error);
    } else {
      setClaimedIssues(data || []);
      setClaimedIssueIds(new Set((data || []).map((d: ClaimedIssue) => d.issue_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchClaimed();
  }, [user, fetchClaimed]);

  const claimIssue = useCallback(async (issue: UnifiedIssue) => {
    if (!user) {
      toast.error('Please sign in to claim issues');
      return false;
    }

    const { error } = await supabase.from('claimed_issues').insert({
      user_id: user.id,
      issue_id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      assignee_name: issue.assignee.name,
      assignee_avatar: issue.assignee.avatar,
      repo_name: issue.repo.name,
      repo_owner: issue.repo.owner,
      repo_full_name: issue.repo.full_name || `${issue.repo.owner}/${issue.repo.name}`,
      labels: issue.labels,
      category: issue.category || null,
      comments: issue.comments,
      is_good_first_issue: issue.isGoodFirstIssue || false,
      html_url: issue.html_url || null,
      created_at: issue.createdAt,
    });

    if (error) {
      if (error.code === '23505') {
        toast.info('You already claimed this issue');
      } else {
        console.error('Claim error:', error);
        toast.error('Failed to claim issue');
      }
      return false;
    }

    toast.success('Issue claimed! Find it in My Issues.');
    await fetchClaimed();
    return true;
  }, [user, fetchClaimed]);

  const unclaimIssue = useCallback(async (issueId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('claimed_issues')
      .delete()
      .eq('user_id', user.id)
      .eq('issue_id', issueId);

    if (error) {
      console.error('Unclaim error:', error);
      toast.error('Failed to unclaim issue');
      return false;
    }

    toast.success('Issue unclaimed');
    await fetchClaimed();
    return true;
  }, [user, fetchClaimed]);

  const updateStatus = useCallback(async (issueId: string, newStatus: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('claimed_issues')
      .update({ status: newStatus })
      .eq('user_id', user.id)
      .eq('issue_id', issueId);

    if (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
      return false;
    }

    await fetchClaimed();
    return true;
  }, [user, fetchClaimed]);

  const toUnifiedIssue = (ci: ClaimedIssue): UnifiedIssue => ({
    id: ci.issue_id,
    title: ci.title,
    description: ci.description,
    status: ci.status as UnifiedIssue['status'],
    priority: ci.priority as UnifiedIssue['priority'],
    assignee: { name: ci.assignee_name, avatar: ci.assignee_avatar },
    repo: { name: ci.repo_name, owner: ci.repo_owner, full_name: ci.repo_full_name },
    labels: ci.labels,
    createdAt: ci.created_at,
    comments: ci.comments,
    isGoodFirstIssue: ci.is_good_first_issue,
    category: ci.category as UnifiedIssue['category'],
    html_url: ci.html_url || undefined,
  });

  return {
    claimedIssues,
    claimedIssueIds,
    loading,
    claimIssue,
    unclaimIssue,
    updateStatus,
    toUnifiedIssue,
    refetch: fetchClaimed,
  };
};
