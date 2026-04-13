import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GitHubIntegration {
  id: string;
  github_username: string;
  avatar_url: string;
  is_active: boolean;
  connected_at: string;
}

interface GitHubRepository {
  id: string;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  topics: string[];
  visibility: string;
  stars_count: number;
  forks_count: number;
  allow_collaboration: boolean;
  collaboration_requests_count?: number;
}

export const useGitHub = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);

  const connectToGitHub = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to connect GitHub');
      return;
    }

    setLoading(true);

    try {
      const clientId = 'Ov23liAiZ90Kg7Y6Vdzf'; // Your GitHub OAuth App Client ID
      const redirectUri = `${globalThis.location.origin}/github-callback`;
      const scope = 'repo,user:email';
      const state = crypto.randomUUID();

      // Store state for verification
      localStorage.setItem('github_oauth_state', state);

      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

      globalThis.location.href = githubAuthUrl;
    } catch (error) {
      console.error('GitHub connection error:', error);
      toast.error('Failed to connect to GitHub');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const syncRepositories = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('github-repositories', {
        method: 'GET',
      });

      if (error) throw error;

      if (data.success) {
        setRepositories(data.repositories);
        toast.success(`Synced ${data.synced_count} repositories`);
      }
    } catch (error) {
      console.error('Repository sync error:', error);
      toast.error('Failed to sync repositories');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleOAuthCallback = useCallback(
    async (code: string, state: string) => {
      if (!user) return;

      const storedState = localStorage.getItem('github_oauth_state');
      if (state !== storedState) {
        toast.error('Invalid OAuth state');
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke('github-oauth', {
          body: { code, state },
        });

        if (error) throw error;

        if (data.success) {
          setIntegration(data.integration);
          toast.success(`Connected to GitHub as ${data.github_user.login}`);
          localStorage.removeItem('github_oauth_state');

          // Automatically sync repositories after connection
          await syncRepositories();
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Failed to complete GitHub connection');
      } finally {
        setLoading(false);
      }
    },
    [user, syncRepositories]
  );

  const updateRepositoryCollaboration = useCallback(
    async (repositoryIds: string[], allowCollaboration: boolean) => {
      if (!user) return;

      setLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke('github-repositories', {
          method: 'POST',
          body: { repositoryIds, allowCollaboration },
        });

        if (error) throw error;

        if (data.success) {
          // Update local state
          setRepositories((prev) =>
            prev.map((repo) =>
              repositoryIds.includes(repo.id)
                ? { ...repo, allow_collaboration: allowCollaboration }
                : repo
            )
          );

          toast.success(`Updated ${repositoryIds.length} repositories`);
        }
      } catch (error) {
        console.error('Repository update error:', error);
        toast.error('Failed to update repositories');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const disconnectGitHub = useCallback(async () => {
    if (!user || !integration) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('github_integrations')
        .update({ is_active: false })
        .eq('id', integration.id);

      if (error) throw error;

      setIntegration(null);
      setRepositories([]);
      toast.success('GitHub disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect GitHub');
    } finally {
      setLoading(false);
    }
  }, [user, integration]);

  const checkIntegration = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('github_integrations')
        .select(
          'id, user_id, github_user_id, github_username, avatar_url, connected_at, updated_at, is_active'
        )
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIntegration(data);
    } catch (error) {
      console.error('Integration check error:', error);
    }
  }, [user]);

  const loadRepositories = useCallback(async () => {
    if (!user || !integration) return;

    try {
      const { data: repos, error } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('integration_id', integration.id)
        .order('stars_count', { ascending: false });

      if (error) throw error;

      // Fetch collaboration request counts for each repository
      if (repos && repos.length > 0) {
        const repoIds = repos.map((r) => r.id);
        const { data: requestCounts, error: countError } = await supabase
          .from('collaboration_requests')
          .select('repository_id')
          .in('repository_id', repoIds);

        if (!countError && requestCounts) {
          // Count requests per repository
          const countMap = requestCounts.reduce(
            (acc, req) => {
              acc[req.repository_id] = (acc[req.repository_id] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          // Merge counts into repositories
          const reposWithCounts = repos.map((repo) => ({
            ...repo,
            collaboration_requests_count: countMap[repo.id] || 0,
          }));

          setRepositories(reposWithCounts);
          return;
        }
      }

      setRepositories(repos || []);
    } catch (error) {
      console.error('Load repositories error:', error);
    }
  }, [user, integration]);

  return {
    loading,
    integration,
    repositories,
    connectToGitHub,
    disconnectGitHub,
    handleOAuthCallback,
    syncRepositories,
    updateRepositoryCollaboration,
    checkIntegration,
    loadRepositories,
  };
};
