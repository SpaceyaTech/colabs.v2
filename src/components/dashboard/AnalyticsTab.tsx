import { ContributionStats } from '@/components/profile/ContributionStats';
import { TechStackChart } from '@/components/profile/TechStackChart';
import { ActivityChart } from '@/components/profile/ActivityChart';
import { WeeklyActivityChart } from '@/components/profile/WeeklyActivityChart';
import { ContributionHeatmap } from '@/components/profile/ContributionHeatmap';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Loader2 } from 'lucide-react';

export function AnalyticsTab() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Calculating your metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load analytics. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Contribution Analytics</h2>

      {/* Main Stats */}
      <ContributionStats stats={data.stats} />

      {/* Contribution Heatmap */}
      <ContributionHeatmap data={data.heatmapData} />

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <TechStackChart techStack={data.techStack} />
        <WeeklyActivityChart weeklyData={data.weeklyData} />
      </div>

      {/* Activity Line Chart */}
      <ActivityChart activityData={data.activityData} />
    </div>
  );
}
