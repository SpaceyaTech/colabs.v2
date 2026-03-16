import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  labels: Array<{ name: string; color: string }>;
  user: { login: string; avatar_url: string };
  assignee: { login: string; avatar_url: string } | null;
  comments: number;
  created_at: string;
  updated_at: string;
}

interface Repository {
  id: string;
  name: string;
  full_name: string;
  html_url: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching issues for user: ${user.id}`);

    // Get the user's active GitHub integration
    const { data: integration, error: integrationError } = await supabase
      .from('github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (integrationError) {
      console.error('Integration error:', integrationError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch GitHub integration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!integration) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          issues: [], 
          message: 'No GitHub integration found. Please connect your GitHub account.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get repositories where collaboration is enabled
    const { data: repositories, error: repoError } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('integration_id', integration.id)
      .eq('allow_collaboration', true);

    if (repoError) {
      console.error('Repository error:', repoError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch repositories' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!repositories || repositories.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          issues: [], 
          message: 'No repositories with collaboration enabled. Enable collaboration on your repositories to see issues.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${repositories.length} repositories with collaboration enabled`);

    // Fetch issues from each repository
    const allIssues: any[] = [];
    const accessToken = integration.access_token;

    for (const repo of repositories) {
      try {
        console.log(`Fetching issues for ${repo.full_name}`);
        
        const response = await fetch(
          `https://api.github.com/repos/${repo.full_name}/issues?state=open&per_page=100`,
          {
            headers: {
              'Authorization': `token ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Lovable-App'
            }
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch issues for ${repo.full_name}: ${response.status}`);
          continue;
        }

        const issues: GitHubIssue[] = await response.json();
        
        // Filter out pull requests (they show up in issues API)
        const realIssues = issues.filter(issue => !issue.html_url.includes('/pull/'));
        
        console.log(`Found ${realIssues.length} issues in ${repo.full_name}`);

        // Transform issues to our format
        for (const issue of realIssues) {
          const labels = issue.labels.map(l => l.name);
          const isGoodFirstIssue = labels.some(l => 
            l.toLowerCase().includes('good first issue') || 
            l.toLowerCase().includes('good-first-issue') ||
            l.toLowerCase().includes('beginner') ||
            l.toLowerCase().includes('easy')
          );
          
          // Determine category from labels
          let category: 'bug' | 'feature' | 'documentation' | 'enhancement' | 'help-wanted' = 'feature';
          if (labels.some(l => l.toLowerCase().includes('bug'))) {
            category = 'bug';
          } else if (labels.some(l => l.toLowerCase().includes('documentation') || l.toLowerCase().includes('docs'))) {
            category = 'documentation';
          } else if (labels.some(l => l.toLowerCase().includes('enhancement'))) {
            category = 'enhancement';
          } else if (labels.some(l => l.toLowerCase().includes('help wanted') || l.toLowerCase().includes('help-wanted'))) {
            category = 'help-wanted';
          }

          // Determine priority from labels
          let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
          if (labels.some(l => l.toLowerCase().includes('urgent') || l.toLowerCase().includes('critical'))) {
            priority = 'urgent';
          } else if (labels.some(l => l.toLowerCase().includes('high') || l.toLowerCase().includes('important'))) {
            priority = 'high';
          } else if (labels.some(l => l.toLowerCase().includes('low'))) {
            priority = 'low';
          }

          allIssues.push({
            id: `${repo.name}-${issue.number}`,
            github_id: issue.id,
            number: issue.number,
            title: issue.title,
            description: issue.body || 'No description provided.',
            status: 'todo' as const,
            priority,
            assignee: issue.assignee 
              ? { name: issue.assignee.login, avatar: issue.assignee.avatar_url }
              : { name: 'Unassigned', avatar: '' },
            repo: {
              name: repo.name,
              owner: repo.full_name.split('/')[0],
              full_name: repo.full_name,
            },
            labels,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            comments: issue.comments,
            isGoodFirstIssue,
            category,
            html_url: issue.html_url,
          });
        }
      } catch (error) {
        console.error(`Error fetching issues for ${repo.full_name}:`, error);
      }
    }

    // Sort by created date (newest first)
    allIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Total issues fetched: ${allIssues.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        issues: allIssues,
        repositories: repositories.map((r: Repository) => ({ id: r.id, name: r.name, full_name: r.full_name }))
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
