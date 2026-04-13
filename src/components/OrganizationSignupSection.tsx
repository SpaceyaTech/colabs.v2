import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Workflow, Zap, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const OrganizationSignupSection = () => {
  const organizationFeatures = [
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage roles, permissions, and team members across all your projects',
    },
    {
      icon: Workflow,
      title: 'Automated Workflows',
      description: 'Connect Slack, GitHub, ClickUp, and Figma for seamless automation',
    },
    {
      icon: Zap,
      title: 'Smart Integrations',
      description: 'Real-time sync between all your favorite development tools',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Role-based access control and secure API key management',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Level Up with Organizations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your team's workflow with our powerful organization dashboard. Connect all
            your tools and automate everything.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {organizationFeatures.map((feature, index) => (
            <Card
              key={index}
              className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-card via-card to-card/80 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl">Ready to Connect Everything?</CardTitle>
              <p className="text-muted-foreground">
                Join organizations using our platform and experience the magic of unified workflow
                management
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-background/50 rounded-lg px-4 py-2">
                  <img
                    src="/lovable-uploads/0e6325b0-6af7-42eb-b9fc-e2c85ed347d2.png"
                    alt="Slack"
                    className="w-6 h-6"
                  />
                  <span className="text-sm font-medium">Slack</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 rounded-lg px-4 py-2">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span className="text-sm font-medium">GitHub</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 rounded-lg px-4 py-2">
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <span className="text-sm font-medium">ClickUp</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 rounded-lg px-4 py-2">
                  <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">F</span>
                  </div>
                  <span className="text-sm font-medium">Figma</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8"
                  asChild
                >
                  <NavLink to="/create-organization">Create Organization</NavLink>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/5"
                  asChild
                >
                  <NavLink to="/organizations">Browse Organizations</NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
