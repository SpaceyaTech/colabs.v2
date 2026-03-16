
import { Card } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Alex Rodriguez",
      role: "Senior Developer at Tech Corp",
      points: "2,840 pts",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "Colabs transformed how I approach open source. The gamification makes contributing addictive in the best way possible. I've learned more in 3 months than I did in years."
    },
    {
      name: "Sarah Chen",
      role: "Full Stack Engineer at StartupXYZ",
      points: "2,720 pts",
      avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&crop=face",
      content: "The leaderboard feature motivated me to contribute daily. It's amazing how a little competition can push you to write better code and help more projects."
    },
    {
      name: "Michael Johnson",
      role: "DevOps Engineer at CloudTech",
      points: "2,580 pts",
      avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face",
      content: "Finding quality projects to contribute to was always a challenge. Colabs' project directory is a game-changer - everything is well-curated and beginner-friendly."
    },
    {
      name: "Emily Davis",
      role: "Frontend Developer at WebStudio",
      points: "2,340 pts",
      avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face",
      content: "The analytics dashboard helps me track my growth as a developer. Seeing my contribution patterns and language distribution motivates me to diversify my skills."
    },
    {
      name: "David Kim",
      role: "Backend Developer at DataFlow",
      points: "2,190 pts",
      avatar: "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=100&h=100&fit=crop&crop=face",
      content: "Colabs made open source accessible to me as a beginner. The achievement system guides you through different types of contributions step by step."
    },
    {
      name: "Lisa Wang",
      role: "Mobile Developer at AppCraft",
      points: "1,980 pts",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      content: "The community aspect is incredible. I've made lasting connections with developers worldwide and learned about different technologies through collaboration."
    }
  ];

  return (
    <section className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Reviews</h2>
          <p className="text-muted-foreground text-lg">
            What our community says about Colabs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-primary font-medium">{testimonial.points}</div>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                "{testimonial.content}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
