import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { NavLink } from 'react-router-dom';
import {
  Building,
  Users,
  Workflow,
  Zap,
  Shield,
  Github,
  Slack,
  ArrowRight,
  CheckCircle,
  Globe,
  Figma,
} from 'lucide-react';

const Organizations = () => {
  const features = [
    {
      icon: Users,
      title: 'Team Management',
      description:
        'Manage roles, permissions, and team members across all your projects with enterprise-grade security.',
      color: 'bg-emerald-500',
    },
    {
      icon: Workflow,
      title: 'Automated Workflows',
      description:
        'Connect Slack, GitHub, ClickUp, and Figma for seamless automation that saves hours every day.',
      color: 'bg-blue-500',
    },
    {
      icon: Zap,
      title: 'Smart Integrations',
      description:
        'Real-time sync between all your favorite development tools with intelligent automation.',
      color: 'bg-purple-500',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Role-based access control, secure API key management, and audit logs for compliance.',
      color: 'bg-orange-500',
    },
  ];

  const integrations = [
    { name: 'GitHub', icon: Github, color: 'bg-gray-900' },
    { name: 'Slack', icon: Slack, color: 'bg-green-600' },
    { name: 'ClickUp', icon: Zap, color: 'bg-blue-600' },
    { name: 'Figma', icon: Figma, color: 'bg-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              🚀 New: GitHub Repository Integration
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Build better together
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Organizations bring your team together with powerful workflow automation, seamless
              integrations, and enterprise-grade security. Connect your favorite tools and let
              automation handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3" asChild>
                <NavLink to="/create-organization">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
                <NavLink to="/pricing">View pricing</NavLink>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group"
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integrations Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Connect everything you use</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Seamlessly integrate with your existing workflow. More integrations coming soon.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-12">
              {integrations.map((integration, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-pointer"
                >
                  <CardContent className="p-6 flex flex-col items-center space-y-3">
                    <div
                      className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <integration.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-sm">{integration.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* GitHub Integration Highlight */}
          <Card className="max-w-4xl mx-auto mb-16 border-2 border-primary/20 bg-gradient-to-r from-card via-card to-card/80 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Github className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">GitHub Repository Monitoring</CardTitle>
              <p className="text-muted-foreground text-lg">
                Connect your GitHub account and select repositories to track issues, pull requests,
                and automate workflows based on repository events.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <h4 className="font-semibold">Auto-sync Issues</h4>
                  <p className="text-sm text-muted-foreground">Track and manage GitHub issues</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <h4 className="font-semibold">PR Notifications</h4>
                  <p className="text-sm text-muted-foreground">Get notified on pull requests</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <h4 className="font-semibold">Workflow Automation</h4>
                  <p className="text-sm text-muted-foreground">Trigger actions on repo events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to transform your workflow?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of teams who have streamlined their development process with our
              organization platform. Start free, upgrade when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                asChild
              >
                <NavLink to="/create-organization">
                  Create your organization
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-primary/30 hover:bg-primary/5"
                asChild
              >
                <NavLink to="/sign-in">Sign in to existing</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Organizations;
