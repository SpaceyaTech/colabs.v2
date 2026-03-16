import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      
      {/* Light effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <ScrollReveal className="text-center space-y-8">
          <h2 className="text-headline text-gradient-subtle">
            Ready to start contributing?
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who are building their careers through 
            meaningful open-source contributions. Start your journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/sign-up">
              <Button 
                size="lg" 
                className="px-8 py-6 text-base bg-foreground text-background hover:bg-foreground/90 rounded-lg"
              >
                Get Started
              </Button>
            </Link>
            <Link to="/projects">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-base border-border hover:bg-muted rounded-lg"
              >
                Explore Projects
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
