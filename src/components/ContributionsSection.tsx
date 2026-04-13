import { Card } from '@/components/ui/card';

const ContributionsSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Get more than just <span className="gradient-text">pushing commits</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Track your development journey with detailed analytics
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Real-time Analytics</h3>
              <p className="text-muted-foreground mb-6">
                Monitor your contribution patterns, see your growth over time, and identify areas
                for improvement with our comprehensive analytics dashboard.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Commit frequency tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Language distribution analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Project impact measurement</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Collaboration network mapping</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 bg-card border-border">
              <h4 className="font-semibold mb-2">Weekly Activity</h4>
              <div className="space-y-2">
                {[40, 60, 30, 80, 50, 70, 45].map((height, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground w-8">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-500"
                        style={{ width: `${height}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h4 className="font-semibold mb-2">Top Languages</h4>
              <div className="space-y-3">
                {[
                  { lang: 'TypeScript', percent: 45, color: 'bg-primary' },
                  { lang: 'JavaScript', percent: 30, color: 'bg-accent' },
                  { lang: 'Python', percent: 15, color: 'bg-primary/60' },
                  { lang: 'Go', percent: 10, color: 'bg-accent/60' },
                ].map((item) => (
                  <div key={item.lang}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.lang}</span>
                      <span className="text-muted-foreground">{item.percent}%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div
                        className={`${item.color} rounded-full h-2 transition-all duration-500`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card border-border col-span-2">
              <h4 className="font-semibold mb-4">Achievement Gallery</h4>
              <div className="grid grid-cols-5 gap-3">
                {['🏆', '🎯', '⚡', '🔥', '💎', '🚀', '⭐', '🎖️', '🏅', '👑'].map((emoji, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center text-2xl hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributionsSection;
