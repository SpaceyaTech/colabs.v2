import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContributionHeatmapProps {
  data: Array<{
    date: string;
    count: number;
  }>;
}

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count <= 2) return 'bg-primary/30';
    if (count <= 5) return 'bg-primary/50';
    if (count <= 8) return 'bg-primary/70';
    return 'bg-primary';
  };

  // Generate last 52 weeks of data (simplified grid)
  const weeks = [];
  for (let week = 0; week < 20; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const index = week * 7 + day;
      const contribution = data[index] || { date: '', count: 0 };
      days.push(contribution);
    }
    weeks.push(days);
  }

  const totalContributions = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Contribution Graph</CardTitle>
          <span className="text-sm text-muted-foreground">
            {totalContributions} contributions in the last 5 months
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            <TooltipProvider>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-default transition-all hover:ring-1 hover:ring-primary`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {day.count} contribution{day.count !== 1 ? 's' : ''} on{' '}
                          {day.date || 'N/A'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/70" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
