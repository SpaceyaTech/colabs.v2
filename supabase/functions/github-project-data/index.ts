const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return new Response(JSON.stringify({ success: false, error: 'repoUrl is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract owner/repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid GitHub URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');
    const apiBase = `https://api.github.com/repos/${owner}/${cleanRepo}`;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Colabs-App',
    };

    // Fetch repo info, contributors, issues, and README in parallel
    const [repoRes, contributorsRes, issuesRes, readmeRes] = await Promise.all([
      fetch(apiBase, { headers }),
      fetch(`${apiBase}/contributors?per_page=12`, { headers }),
      fetch(`${apiBase}/issues?state=open&per_page=30&sort=created&direction=desc`, { headers }),
      fetch(`${apiBase}/readme`, {
        headers: { ...headers, Accept: 'application/vnd.github.v3+json' },
      }),
    ]);

    const repoData = repoRes.ok ? await repoRes.json() : null;
    const contributors = contributorsRes.ok ? await contributorsRes.json() : [];
    const issues = issuesRes.ok ? await issuesRes.json() : [];
    const readmeData = readmeRes.ok ? await readmeRes.json() : null;

    // Sort issues: good first issues first
    const sortedIssues = issues
      .filter((i: any) => !i.pull_request) // exclude PRs
      .map((i: any) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        labels: i.labels.map((l: any) => ({ name: l.name, color: l.color })),
        state: i.state,
        created_at: i.created_at,
        comments: i.comments,
        html_url: i.html_url,
        user: { login: i.user.login, avatar_url: i.user.avatar_url },
        is_good_first_issue: i.labels.some(
          (l: any) =>
            l.name.toLowerCase().includes('good first issue') ||
            l.name.toLowerCase().includes('beginner') ||
            l.name.toLowerCase().includes('easy')
        ),
      }))
      .sort((a: any, b: any) => {
        if (a.is_good_first_issue && !b.is_good_first_issue) return -1;
        if (!a.is_good_first_issue && b.is_good_first_issue) return 1;
        return 0;
      });

    const result = {
      success: true,
      data: {
        repo: repoData
          ? {
              full_name: repoData.full_name,
              description: repoData.description,
              html_url: repoData.html_url,
              stars: repoData.stargazers_count,
              forks: repoData.forks_count,
              watchers: repoData.subscribers_count,
              open_issues: repoData.open_issues_count,
              language: repoData.language,
              topics: repoData.topics || [],
              default_branch: repoData.default_branch,
              updated_at: repoData.updated_at,
              license: repoData.license?.spdx_id || null,
            }
          : null,
        contributors: Array.isArray(contributors)
          ? contributors.map((c: any) => ({
              login: c.login,
              avatar_url: c.avatar_url,
              contributions: c.contributions,
              html_url: c.html_url,
            }))
          : [],
        issues: sortedIssues.slice(0, 15),
        readme_url: readmeData?.html_url || `https://github.com/${owner}/${cleanRepo}#readme`,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
