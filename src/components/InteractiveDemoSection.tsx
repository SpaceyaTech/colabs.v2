import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Activity,
  GitCommit,
  GitPullRequest,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

const InteractiveDemoSection = () => {
  // Sample data for charts
  const activityData = [
    { month: 'Jan', commits: 45, prs: 8 },
    { month: 'Feb', commits: 62, prs: 12 },
    { month: 'Mar', commits: 78, prs: 15 },
    { month: 'Apr', commits: 55, prs: 10 },
    { month: 'May', commits: 89, prs: 18 },
    { month: 'Jun', commits: 95, prs: 22 },
  ];

  const weeklyData = [
    { day: 'Mon', hours: 6 },
    { day: 'Tue', hours: 8 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 9 },
    { day: 'Fri', hours: 7 },
    { day: 'Sat', hours: 3 },
    { day: 'Sun', hours: 2 },
  ];

  const radarData = [
    { skill: 'React', value: 90 },
    { skill: 'TypeScript', value: 85 },
    { skill: 'Node.js', value: 75 },
    { skill: 'Python', value: 60 },
    { skill: 'Go', value: 45 },
    { skill: 'Docker', value: 70 },
  ];

  // Generate heatmap data
  const generateHeatmapData = () => {
    const data = [];
    for (let week = 0; week < 15; week++) {
      for (let day = 0; day < 7; day++) {
        data.push(Math.floor(Math.random() * 10));
      }
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-muted/30';
    if (count <= 2) return 'bg-primary/20';
    if (count <= 5) return 'bg-primary/40';
    if (count <= 7) return 'bg-primary/60';
    return 'bg-primary';
  };

  const features = [
    {
      icon: GitCommit,
      title: 'Commit Tracking',
      description: 'Every commit counts towards your profile',
    },
    {
      icon: GitPullRequest,
      title: 'PR Analytics',
      description: 'Track pull request velocity over time',
    },
    {
      icon: Clock,
      title: 'Time Insights',
      description: 'Understand your coding patterns',
    },
    {
      icon: TrendingUp,
      title: 'Growth Metrics',
      description: 'Visualize your improvement journey',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-spotlight" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-muted-foreground border-border">
            Analytics
          </Badge>
          <h2 className="text-headline text-gradient-subtle mb-6">Visualize your contributions</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Beautiful charts and graphs that tell the story of your open-source journey. Track
            commits, pull requests, and coding patterns in real-time.
          </p>
        </ScrollReveal>

        {/* Analytics showcase */}
        <ScrollReveal delay={0.1}>
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Main activity chart */}
            <Card className="lg:col-span-2 p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium text-foreground">Contribution Activity</h3>
                  <p className="text-sm text-muted-foreground">Commits & PRs over time</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Commits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">PRs</span>
                  </div>
                </div>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activityData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="commits"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 0, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="prs"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Radar chart */}
            <Card className="p-6 bg-card border-border">
              <div className="mb-4">
                <h3 className="font-medium text-foreground">Tech Proficiency</h3>
                <p className="text-sm text-muted-foreground">Skills breakdown</p>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Contribution heatmap */}
            <Card className="lg:col-span-2 p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-foreground">Contribution Graph</h3>
                  <p className="text-sm text-muted-foreground">
                    424 contributions in the last 4 months
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="flex gap-1">
                  {Array.from({ length: 15 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, dayIndex) => (
                        <motion.div
                          key={dayIndex}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.2,
                            delay: (weekIndex * 7 + dayIndex) * 0.005,
                          }}
                          className={`w-3 h-3 rounded-sm ${getHeatmapColor(heatmapData[weekIndex * 7 + dayIndex])}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted/30" />
                  <div className="w-3 h-3 rounded-sm bg-primary/20" />
                  <div className="w-3 h-3 rounded-sm bg-primary/40" />
                  <div className="w-3 h-3 rounded-sm bg-primary/60" />
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                </div>
                <span>More</span>
              </div>
            </Card>

            {/* Weekly activity */}
            <Card className="p-6 bg-card border-border">
              <div className="mb-4">
                <h3 className="font-medium text-foreground">Weekly Activity</h3>
                <p className="text-sm text-muted-foreground">Hours coded per day</p>
              </div>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={value => `${value}h`}
                    />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.hours === Math.max(...weeklyData.map(d => d.hours))
                              ? 'hsl(var(--primary))'
                              : 'hsl(var(--primary) / 0.4)'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Feature highlights */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-4 bg-card/50 border-border hover:bg-card transition-colors">
                  <feature.icon className="w-5 h-5 text-primary mb-3" />
                  <h4 className="font-medium text-foreground text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.4}>
          <div className="text-center mt-12">
            <Link to="/sign-up">
              <Button className="bg-foreground text-background hover:bg-foreground/90 group">
                Start tracking your contributions
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;
