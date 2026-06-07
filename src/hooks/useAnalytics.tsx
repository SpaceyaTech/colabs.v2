import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AnalyticsData {
  stats: {
    totalPRs: number;
    totalCommits: number;
    hoursContributed: number;
    projectsContributed: number;
  };
  techStack: Array<{ name: string; proficiency: number; projects: number; color: string }>;
  activityData: Array<{ month: string; commits: number; prs: number }>;
  weeklyData: Array<{ day: string; hours: number }>;
  heatmapData: Array<{ date: string; count: number }>;
}

const TECH_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  React: '#61dafb',
  Python: '#3776ab',
  'Node.js': '#68a063',
  PostgreSQL: '#336791',
  Docker: '#2496ed',
  Go: '#00add8',
  Rust: '#dea584',
};

export function useAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user) throw new Error('User not authenticated');

      // 1. Fetch claimed issues to derive stats
      const { data: issues, error: issuesError } = await supabase
        .from('claimed_issues')
        .select('*')
        .eq('user_id', user.id);

      if (issuesError) throw issuesError;

      // 2. Fetch projects contributed to (via claimed issues)
      const projectNames = Array.from(new Set(issues?.map((i) => i.repo_full_name) || []));

      // Mocking some stats derived from issues since the DB doesn't track commits/PRs directly yet
      // In a real scenario, we'd fetch this from a 'contributions' table or GitHub API
      const totalPRs = issues?.filter((i) => i.status === 'done').length || 0;
      const totalCommits = totalPRs * 5; // Estimation
      const hoursContributed = totalPRs * 4; // Estimation

      // 3. Derive tech stack from repositories of claimed issues
      const techMap: Record<string, { projects: number }> = {};
      issues?.forEach((issue) => {
        // This is a simplification; ideally we'd have a technologies array per issue or repo
        const lang = issue.category || 'TypeScript'; // Fallback
        techMap[lang] = { projects: (techMap[lang]?.projects || 0) + 1 };
      });

      const techStack = Object.entries(techMap).map(([name, data]) => ({
        name,
        proficiency: Math.min(100, data.projects * 10),
        projects: data.projects,
        color: TECH_COLORS[name] || '#888888',
      }));

      // 4. Activity Data (Monthly)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const activityData = months.map((month) => ({
        month,
        commits: Math.floor(Math.random() * 20), // Placeholder until we have a contribution log
        prs: Math.floor(Math.random() * 5),
      }));

      // 5. Weekly Data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyData = days.map((day) => ({
        day,
        hours: (issues?.filter(i => i.status === 'in-progress').length || 0) * Math.random() * 2,
      }));

      // 6. Heatmap Data (Last 140 days)
      const heatmapData = [];
      const today = new Date();
      for (let i = 140; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayIssues = issues?.filter(
          (iss) => new Date(iss.claimed_at).toDateString() === date.toDateString()
        );
        heatmapData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: dayIssues?.length || 0,
        });
      }

      return {
        stats: {
          totalPRs,
          totalCommits,
          hoursContributed,
          projectsContributed: projectNames.length,
        },
        techStack: techStack.length > 0 ? techStack : [
          { name: 'TypeScript', proficiency: 0, projects: 0, color: '#3178c6' }
        ],
        activityData,
        weeklyData,
        heatmapData,
      };
    },
    enabled: !!user,
  });
}
