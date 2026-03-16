
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, Target, Clock, Shield, Zap, Star, DollarSign } from "lucide-react";
import wireframeAnalytics from "@/assets/wireframe-analytics.jpg";
import wireframeMarketplace from "@/assets/wireframe-marketplace.jpg";
import wireframeMonetization from "@/assets/wireframe-monetization.jpg";

const OrganizationsSection = () => {
  const topFeatures = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track your contribution patterns, see detailed analytics of your open-source journey, and gain insights into your development progress.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      image: wireframeAnalytics
    },
    {
      icon: Star,
      title: "Marketplace",
      description: "Discover and purchase high-quality projects built by talented developers, or sell your own projects to a global community of developers.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      image: wireframeMarketplace
    },
    {
      icon: DollarSign,
      title: "Monetize your Time",
      description: "Access paying private projects to help younger developers and freelancers gain valuable experience while earning money for their contributions.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      image: wireframeMonetization
    }
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Team Performance Analytics",
      description: "Monitor individual and team contributions with detailed metrics including commit frequency, code quality scores, and project completion rates.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Users,
      title: "Developer Skill Assessment",
      description: "Track skill development across different technologies and frameworks with automated assessments and peer reviews.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Target,
      title: "Goal Setting & Tracking",
      description: "Set and monitor development goals for individuals and teams with milestone tracking and progress visualization.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Clock,
      title: "Time & Productivity Insights",
      description: "Understand time allocation across projects and identify bottlenecks to optimize development workflows.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Shield,
      title: "Code Quality Monitoring",
      description: "Automated code review metrics, security vulnerability tracking, and best practices compliance monitoring.",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Zap,
      title: "Real-time Collaboration",
      description: "Live collaboration metrics, pair programming insights, and team communication effectiveness scoring.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    }
  ];

  const stats = [
    { label: "Average Team Productivity Increase", value: "40%" },
    { label: "Faster Project Completion", value: "25%" },
    { label: "Developer Satisfaction Score", value: "4.8/5" },
    { label: "Organizations Using Colabs", value: "500+" }
  ];

  return (
    <section id="organizations" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Top Features Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Get more than just{" "}
            <span className="gradient-text">pushing commits</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Transform your development journey with gamified contributions, real rewards, and meaningful connections in the open-source community.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {topFeatures.map((feature, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Wireframe Image */}
              <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={`${feature.title} wireframe mockup`}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute top-4 left-4">
                  <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center backdrop-blur-sm`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Organizations Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary">For Organizations</Badge>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
          <h2 className="text-5xl font-bold mb-6">
            Empower your development teams with{" "}
            <span className="gradient-text">data-driven insights</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Monitor, analyze, and optimize your team's performance with comprehensive analytics and actionable insights that drive real results.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to transform your development workflow?
          </h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations already using Colabs to build better software, faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" disabled className="opacity-60 text-lg px-8 py-6">
              Request Demo
            </Button>
            <Button variant="outline" size="lg" disabled className="opacity-60 text-lg px-8 py-6">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizationsSection;
