import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface TechStackChartProps {
  techStack: Array<{
    name: string;
    proficiency: number;
    projects: number;
    color: string;
  }>;
}

const chartConfig = {
  proficiency: {
    label: 'Proficiency',
    color: 'hsl(var(--primary))',
  },
};

export function TechStackChart({ techStack }: TechStackChartProps) {
  const radarData = techStack.map((tech) => ({
    skill: tech.name,
    value: tech.proficiency,
    fullMark: 100,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Tech Stack Proficiency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="h-[280px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar
                name="Proficiency"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ChartContainer>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          {techStack.slice(0, 5).map((tech) => (
            <div key={tech.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tech.color }} />
                  <span className="font-medium">{tech.name}</span>
                </div>
                <span className="text-muted-foreground">{tech.projects} projects</span>
              </div>
              <Progress value={tech.proficiency} className="h-2" />
            </div>
          ))}
        </div>

        {/* All tech badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {techStack.map((tech) => (
            <Badge key={tech.name} variant="secondary" className="text-xs">
              {tech.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
