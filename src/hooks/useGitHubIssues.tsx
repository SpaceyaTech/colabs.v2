import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GitHubIssue {
  id: string;
  github_id: number;
  number: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: {
    name: string;
    avatar: string;
  };
  repo: {
    name: string;
    owner: string;
    full_name: string;
  };
  labels: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  isGoodFirstIssue: boolean;
  category: 'bug' | 'feature' | 'documentation' | 'enhancement' | 'help-wanted';
  html_url: string;
}

interface Repository {
  id: string;
  name: string;
  full_name: string;
}

export const useGitHubIssues = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    if (!user || !session) {
      setError('Please sign in to view issues');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('github-issues', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) {
        console.error('Function error:', fnError);
        throw new Error(fnError.message || 'Failed to fetch issues');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.message) {
        setMessage(data.message);
      }

      setIssues(data.issues || []);
      setRepositories(data.repositories || []);

      if (data.issues?.length > 0) {
        toast.success(`Loaded ${data.issues.length} issues from GitHub`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch issues';
      console.error('Fetch issues error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  // Inline IIFE — keeps all setState calls inside the async continuation
  // (react-hooks/set-state-in-effect)
  useEffect(() => {
    if (!user || !session) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('github-issues', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (cancelled) return;
        if (fnError) throw new Error(fnError.message || 'Failed to fetch issues');
        if (data.error) throw new Error(data.error);
        if (data.message) setMessage(data.message);
        setIssues(data.issues || []);
        setRepositories(data.repositories || []);
        if (data.issues?.length > 0) {
          toast.success(`Loaded ${data.issues.length} issues from GitHub`);
        }
      } catch (err) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch issues';
        console.error('Fetch issues error:', err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, session]);

  return {
    loading,
    issues,
    repositories,
    error,
    message,
    fetchIssues,
    refetch: fetchIssues,
  };
};
