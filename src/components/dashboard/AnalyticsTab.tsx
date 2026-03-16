import { useState } from "react";
import { ContributionStats } from "@/components/profile/ContributionStats";
import { TechStackChart } from "@/components/profile/TechStackChart";
import { ActivityChart } from "@/components/profile/ActivityChart";
import { WeeklyActivityChart } from "@/components/profile/WeeklyActivityChart";
import { ContributionHeatmap } from "@/components/profile/ContributionHeatmap";

const mockContributionStats = {
  totalPRs: 47,
  totalCommits: 342,
  hoursContributed: 156,
  projectsContributed: 12,
};

const mockTechStack = [
  { name: "TypeScript", proficiency: 92, projects: 8, color: "#3178c6" },
  { name: "React", proficiency: 88, projects: 7, color: "#61dafb" },
  { name: "Python", proficiency: 75, projects: 4, color: "#3776ab" },
  { name: "Node.js", proficiency: 82, projects: 5, color: "#68a063" },
  { name: "PostgreSQL", proficiency: 70, projects: 3, color: "#336791" },
  { name: "Docker", proficiency: 65, projects: 2, color: "#2496ed" },
  { name: "Go", proficiency: 45, projects: 1, color: "#00add8" },
  { name: "Rust", proficiency: 30, projects: 1, color: "#dea584" },
];

const mockActivityData = [
  { month: "Jul", commits: 28, prs: 4 },
  { month: "Aug", commits: 45, prs: 6 },
  { month: "Sep", commits: 32, prs: 5 },
  { month: "Oct", commits: 52, prs: 8 },
  { month: "Nov", commits: 68, prs: 10 },
  { month: "Dec", commits: 41, prs: 6 },
  { month: "Jan", commits: 76, prs: 8 },
];

const mockWeeklyData = [
  { day: "Mon", hours: 3.5 },
  { day: "Tue", hours: 4.2 },
  { day: "Wed", hours: 2.8 },
  { day: "Thu", hours: 5.1 },
  { day: "Fri", hours: 3.9 },
  { day: "Sat", hours: 6.2 },
  { day: "Sun", hours: 2.1 },
];

const generateHeatmapData = () => {
  const data = [];
  const today = new Date();
  for (let i = 140; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: Math.floor(Math.random() * 12),
    });
  }
  return data;
};

export function AnalyticsTab() {
  const [heatmapData] = useState(generateHeatmapData);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Contribution Analytics</h2>
      
      {/* Main Stats */}
      <ContributionStats stats={mockContributionStats} />

      {/* Contribution Heatmap */}
      <ContributionHeatmap data={heatmapData} />

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <TechStackChart techStack={mockTechStack} />
        <WeeklyActivityChart weeklyData={mockWeeklyData} />
      </div>

      {/* Activity Line Chart */}
      <ActivityChart activityData={mockActivityData} />
    </div>
  );
}
