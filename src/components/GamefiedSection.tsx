import { Card } from '@/components/ui/card';
import { Trophy, Flame, GitPullRequest, Star } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const GamefiedSection = () => {
  const leaderboardUsers = [
    { rank: 1, name: 'Alex Rodriguez', commits: 1250, country: '🇳🇬', level: 12 },
    { rank: 2, name: 'Sarah Chen', commits: 980, country: '🇿🇦', level: 10 },
    { rank: 3, name: 'Michael Johnson', commits: 875, country: '🇰🇪', level: 9 },
    { rank: 4, name: 'Emily Davis', commits: 720, country: '🇬🇭', level: 8 },
    { rank: 5, name: 'David Wilson', commits: 650, country: '🇲🇦', level: 7 },
  ];

  const achievements = [
    {
      icon: Trophy,
      title: 'First Contribution',
      description: 'Make your first commit',
      color: 'text-yellow-400',
    },
    {
      icon: Flame,
      title: 'Streak Master',
      description: '7-day contribution streak',
      color: 'text-orange-400',
    },
    {
      icon: GitPullRequest,
      title: 'Code Reviewer',
      description: 'Review 10 pull requests',
      color: 'text-blue-400',
    },
    {
      icon: Star,
      title: 'Open Source Hero',
      description: 'Contribute to 25 projects',
      color: 'text-purple-400',
    },
  ];

  return (
    <section className="py-24 bg-gradient-spotlight relative">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-headline text-gradient-subtle mb-6">
            Compete with developers worldwide
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Climb the leaderboard, earn achievements, and showcase your open-source contributions
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Leaderboard */}
          <ScrollReveal delay={0.1}>
            <Card className="p-8 bg-card border-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-medium">Global Leaderboard</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </div>
              </div>

              <div className="space-y-4">
                {leaderboardUsers.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-light text-muted-foreground w-8">
                        {user.rank}
                      </span>
                      <span className="text-xl">{user.country}</span>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">Level {user.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{user.commits.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">commits</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>

          {/* Achievements */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-4">Achievement System</h3>
                <p className="text-muted-foreground mb-8">
                  Unlock badges and rewards as you contribute to different projects and master new
                  technologies.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="p-6 bg-card border-border feature-card">
                    <achievement.icon className={`w-8 h-8 ${achievement.color} mb-4`} />
                    <h4 className="font-medium text-foreground mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </Card>
                ))}
              </div>

              {/* Stats preview */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-light text-foreground">50+</div>
                  <div className="text-xs text-muted-foreground mt-1">Badges</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-light text-foreground">12</div>
                  <div className="text-xs text-muted-foreground mt-1">Levels</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-light text-foreground">∞</div>
                  <div className="text-xs text-muted-foreground mt-1">Rewards</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default GamefiedSection;
