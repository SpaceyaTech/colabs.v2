// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    if (req.method === 'GET') {
      // Fetch repositories from GitHub and sync to database
      console.log(`Fetching repositories for user ${user.id}`);

      // Get user's GitHub integration and secrets
      const { data: integration, error: integrationError } = await supabase
        .from('github_integrations')
        .select('*, github_integration_secrets(access_token)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (integrationError || !integration) {
        throw new Error('GitHub integration not found or inactive');
      }

      const secrets = integration.github_integration_secrets as any;
      const accessToken = Array.isArray(secrets) ? secrets[0]?.access_token : secrets?.access_token;

      if (!accessToken) {
        throw new Error('GitHub access token not found');
      }

      // Fetch repositories from GitHub API
      const reposResponse = await fetch(
        'https://api.github.com/user/repos?per_page=100&sort=updated',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories from GitHub');
      }

      const githubRepos = await reposResponse.json();
      console.log(`Found ${githubRepos.length} repositories`);

      // Sync repositories to database
      const repoInserts = githubRepos.map((repo: any) => ({
        integration_id: integration.id,
        github_repo_id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        default_branch: repo.default_branch,
        language: repo.language,
        topics: repo.topics,
        visibility: repo.private ? 'private' : 'public',
        stars_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        is_private: repo.private,
        is_fork: repo.fork,
        is_template: repo.is_template,
        allow_collaboration: false, // Default to false, user can enable later
        synced_at: new Date().toISOString(),
      }));

      const { data: syncedRepos, error: syncError } = await supabase
        .from('github_repositories')
        .upsert(repoInserts, {
          onConflict: 'integration_id,github_repo_id',
          ignoreDuplicates: false,
        })
        .select();

      if (syncError) {
        console.error('Sync error:', syncError);
        throw new Error('Failed to sync repositories');
      }

      return new Response(
        JSON.stringify({
          success: true,
          repositories: syncedRepos,
          synced_count: syncedRepos?.length || 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (req.method === 'POST') {
      // Update repository collaboration settings
      const { repositoryIds, allowCollaboration } = await req.json();

      if (!Array.isArray(repositoryIds)) {
        throw new Error('Repository IDs must be an array');
      }

      const { data: updatedRepos, error: updateError } = await supabase
        .from('github_repositories')
        .update({
          allow_collaboration: allowCollaboration,
          updated_at: new Date().toISOString(),
        })
        .in('id', repositoryIds)
        .eq(
          'integration_id',
          (await supabase.from('github_integrations').select('id').eq('user_id', user.id).single())
            .data?.id
        )
        .select();

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update repositories');
      }

      return new Response(
        JSON.stringify({
          success: true,
          updated_repositories: updatedRepos,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Method not allowed');
  } catch (error) {
    console.error('GitHub repositories error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
