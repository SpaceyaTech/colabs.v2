
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Eye, Code2, Smartphone, Globe } from "lucide-react";

const MarketplaceSection = () => {
  const featuredProjects = [
    {
      title: "E-commerce Dashboard",
      category: "Web App",
      price: "$149",
      rating: 4.8,
      downloads: 234,
      views: 1200,
      tech: ["React", "TypeScript", "Tailwind"],
      icon: Globe,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
    },
    {
      title: "Mobile Banking UI Kit",
      category: "Mobile App",
      price: "$89",
      rating: 4.9,
      downloads: 189,
      views: 890,
      tech: ["Flutter", "Dart", "Material"],
      icon: Smartphone,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop"
    },
    {
      title: "API Documentation Tool",
      category: "Developer Tool",
      price: "$199",
      rating: 4.7,
      downloads: 156,
      views: 2100,
      tech: ["Node.js", "Express", "MongoDB"],
      icon: Code2,
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary">Marketplace</Badge>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Discover amazing projects from{" "}
            <span className="gradient-text">talented developers</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Browse, purchase, and sell high-quality projects. From complete applications to reusable components - find what you need or monetize your skills.
          </p>
        </div>

        {/* Project Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredProjects.map((project, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Project Image/Preview */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <project.icon className="h-16 w-16 text-primary/60" />
                </div>
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{project.category}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500/90 text-white">{project.price}</Badge>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>{project.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{project.downloads}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{project.views}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    Purchase
                  </Button>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button size="lg" disabled className="opacity-60">
              Explore Marketplace
            </Button>
            <Button variant="outline" size="lg" disabled className="opacity-60">
              Become a Seller
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceSection;
