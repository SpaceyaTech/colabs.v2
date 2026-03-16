import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, GitFork, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";

const ProjectsSection = () => {
  const projects = [
    {
      id: 1,
      name: "React UI Components",
      description: "A comprehensive library of reusable React components built with TypeScript and Tailwind CSS.",
      language: "TypeScript",
      stars: 1234,
      forks: 89,
      difficulty: "Beginner",
    },
    {
      id: 2,
      name: "Node.js Authentication API",
      description: "Secure authentication service with JWT tokens, OAuth integration, and user management.",
      language: "JavaScript",
      stars: 892,
      forks: 156,
      difficulty: "Intermediate",
    },
    {
      id: 3,
      name: "Python Data Analytics Tool",
      description: "Advanced data processing and visualization toolkit for analyzing large datasets.",
      language: "Python",
      stars: 567,
      forks: 78,
      difficulty: "Advanced",
    },
    {
      id: 4,
      name: "Vue.js E-commerce Platform",
      description: "Full-featured e-commerce solution with shopping cart and payment integration.",
      language: "Vue.js",
      stars: 743,
      forks: 134,
      difficulty: "Intermediate",
    },
    {
      id: 5,
      name: "Go Microservices Framework",
      description: "Lightweight framework for building scalable microservices with service discovery.",
      language: "Go",
      stars: 445,
      forks: 67,
      difficulty: "Advanced",
    },
    {
      id: 6,
      name: "React Native Mobile App",
      description: "Cross-platform mobile application with native performance and modern UI.",
      language: "TypeScript",
      stars: 321,
      forks: 45,
      difficulty: "Beginner",
    }
  ];

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'TypeScript': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'Python': 'bg-green-500',
      'Vue.js': 'bg-emerald-500',
      'Go': 'bg-cyan-500',
    };
    return colors[language] || 'bg-muted-foreground';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-headline text-gradient-subtle mb-6">
            Discover amazing projects
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find projects that match your skills and interests. Contribute to real-world 
            applications and make a difference in the open-source community.
          </p>
        </ScrollReveal>

        {/* Filter tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {['All', 'Beginner Friendly', 'TypeScript', 'Python', 'Go', 'JavaScript'].map((filter, index) => (
              <Button
                key={filter}
                variant={index === 0 ? 'default' : 'ghost'}
                size="sm"
                className={`text-sm rounded-full ${index === 0 ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-card border-border feature-card group cursor-pointer h-full">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getLanguageColor(project.language)}`} />
                    <span className="text-sm text-muted-foreground">{project.language}</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(project.difficulty)} border-0`}>
                    {project.difficulty}
                  </Badge>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{project.stars.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{project.forks}</span>
                  </div>
                </div>
              </div>
            </Card>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-12">
          <Link to="/projects">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground group">
              View all projects
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
