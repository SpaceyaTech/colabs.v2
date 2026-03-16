import { Card } from "@/components/ui/card";
import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";

const CombinedStatsTestimonialsSection = () => {
  const stats = [
    { number: "1,013", label: "Contributors", sublabel: "Active this month" },
    { number: "474", label: "Projects", sublabel: "Open source" },
    { number: "14", label: "Countries", sublabel: "Worldwide" },
    { number: "50K+", label: "Commits", sublabel: "This year" },
  ];

  const testimonials = [
    {
      name: "Alex Rodriguez",
      role: "Senior Developer at Tech Corp",
      content: "Colabs transformed how I approach open source. The gamification makes contributing addictive in the best way possible."
    },
    {
      name: "Sarah Chen",
      role: "Full Stack Engineer at StartupXYZ",
      content: "The leaderboard feature motivated me to contribute daily. It's amazing how a little competition can push you to write better code."
    },
    {
      name: "Michael Johnson",
      role: "DevOps Engineer at CloudTech",
      content: "Finding quality projects to contribute to was always a challenge. Colabs' project directory is a game-changer."
    },
  ];

  return (
    <section className="py-24 bg-gradient-spotlight relative">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-light text-foreground mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials header */}
        <ScrollReveal className="text-center mb-12">
          <p className="text-muted-foreground">
            Colabs is driving remarkable developer experiences that enable success stories, 
            empower developers, and fuel growth across industries.
          </p>
        </ScrollReveal>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-card border-border feature-card h-full">
                <blockquote className="text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-medium text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CombinedStatsTestimonialsSection;
