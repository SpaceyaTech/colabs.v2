import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, DollarSign, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { motion } from 'framer-motion';

const AnalyticsSection = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description:
        'Track your contribution patterns and coding streaks. Analyze language usage and project impact with detailed visualizations.',
      link: '/dashboard',
      linkText: 'Go to your dashboard',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Empower Technical Team Leads with advanced project insights. Help Product Managers track development velocity.',
      link: '/organizations',
      linkText: 'Learn about team features',
    },
    {
      icon: DollarSign,
      title: 'Monetize Your Time',
      description:
        'Earn real money for quality contributions. Access sponsored project opportunities and performance-based rewards.',
      link: '/projects',
      linkText: 'Explore paid projects',
    },
    {
      icon: ShoppingCart,
      title: 'Marketplace',
      description:
        'Browse thousands of freelance projects. Match your skills with perfect opportunities and secure payments.',
      link: '/marketplace',
      linkText: 'Browse marketplace',
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-headline text-gradient-subtle mb-6">
            First-class developer experience
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We are a team of engineers who love building tools for other engineers. Our goal is to
            create the platform we've always wished we had.
          </p>
        </ScrollReveal>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-8 bg-card border-border feature-card group h-full">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>

                  <Link to={feature.link}>
                    <Button
                      variant="ghost"
                      className="px-0 text-muted-foreground hover:text-foreground group/link"
                    >
                      {feature.linkText}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Code preview mockup */}
        <div className="mt-16">
          <Card className="p-6 bg-card border-border overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="ml-4 text-sm text-muted-foreground">contribution-stats.ts</span>
            </div>
            <pre className="text-sm text-muted-foreground font-mono overflow-x-auto">
              <code>{`import { Colabs } from 'colabs-sdk';

const colabs = new Colabs('your_api_key');

// Get your contribution stats
const stats = await colabs.stats.get({
  userId: 'current',
  period: 'month'
});

console.log(\`Commits: \${stats.commits}\`);
console.log(\`PRs: \${stats.pullRequests}\`);
console.log(\`Level: \${stats.level}\`);`}</code>
            </pre>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
