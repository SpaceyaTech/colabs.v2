import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface WeeklyActivityChartProps {
  weeklyData: Array<{
    day: string;
    hours: number;
  }>;
}

const chartConfig = {
  hours: {
    label: "Hours",
    color: "hsl(var(--primary))",
  },
};

export function WeeklyActivityChart({ weeklyData }: WeeklyActivityChartProps) {
  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Coding Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="day" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => `${value}h`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`${value} hours`, "Coding"]}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hours === maxHours ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
