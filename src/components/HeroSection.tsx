import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { useState } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Company logos for the trust section with SVG icons
  const companies = [
    {
      name: "GitHub",
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      name: "GitLab",
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 00-.867 0L1.386 9.452.044 13.587a.924.924 0 00.331 1.023L12 23.054l11.625-8.443a.92.92 0 00.33-1.024"/>
        </svg>
      )
    },
    {
      name: "Vercel",
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M24 22.525H0l12-21.05 12 21.05z"/>
        </svg>
      )
    },
    {
      name: "Netlify",
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M16.934 8.519a1.044 1.044 0 01.303.23l2.349-1.045-2.192-2.171-.491 2.954zM12.06 6.546a1.305 1.305 0 01.209.574l3.497 1.482a1.044 1.044 0 01.48-.18l.55-3.305-4.736 1.43zm-1.014.66l-5.458 6.589a1.098 1.098 0 01.158.107l6.946-3.564a1.087 1.087 0 01-.106-.322l-1.54-.81zm7.863 2.534l-2.118.943a1.087 1.087 0 01-.1.71l4.033 3.986 1.29-1.283-3.105-4.356zm-8.424 4.52l-6.963 3.571a1.098 1.098 0 01-.056.254l7.108 4.125.076-.157-.165-7.793zm8.026-1.572a1.142 1.142 0 01-.484.247l-.907 5.474 6.303-6.24-4.912.52zm-8.262.907a1.098 1.098 0 01-.645.02L4.399 17.41l7.32 4.25.54-4.696-2.01-2.499zm3.247-4.386a1.044 1.044 0 01-.396.153l1.509 6.99a1.109 1.109 0 01.424.233l4.82-3.06-6.357-4.316zM12.207 0L2.17 3.176l10.01 3.028-10.22 12.342L12.207 24V0z"/>
        </svg>
      )
    },
    {
      name: "Supabase",
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M11.9 23.3c-.5.6-1.5.2-1.5-.6V12h10.8c.9 0 1.4 1.1.8 1.8l-10.1 9.5zM12.1.7c.5-.6 1.5-.2 1.5.6V12H2.8c-.9 0-1.4-1.1-.8-1.8L12.1.7z"/>
        </svg>
      )
    },
    {
      name: "Stripe",
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
        </svg>
      )
    },
    {
      name: "Notion",
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 2.017c-.373-.28-.84-.373-1.4-.327L3.62 3.11c-.466.046-.56.28-.373.466zm.793 3.172v13.867c0 .746.373 1.026 1.213.98l14.523-.84c.84-.047.933-.56.933-1.166V6.26c0-.606-.233-.886-.746-.84l-15.177.886c-.56.047-.746.28-.746.933zm14.337.7c.093.42 0 .84-.42.887l-.7.14v10.264c-.606.327-1.166.514-1.633.514-.746 0-.933-.234-1.493-.934l-4.572-7.186v6.952l1.446.327s0 .84-1.166.84l-3.218.187c-.093-.187 0-.653.327-.747l.84-.233V9.853L7.374 9.7c-.093-.42.14-1.026.793-1.073l3.452-.234 4.759 7.28V9.187l-1.213-.14c-.093-.513.28-.886.746-.933zM2.3 1.583l13.634-.816c1.679-.14 2.112.093 2.818.606l3.892 2.751c.466.326.606.42.606.886v15.024c0 .933-.326 1.492-1.492 1.586l-15.49.933c-.886.047-1.306-.093-1.772-.653l-2.819-3.638C1.17 17.695 1 17.229 1 16.623V3.442c0-.746.326-1.399 1.3-1.859z"/>
        </svg>
      )
    },
    {
      name: "Linear",
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M3.016 11.478c-.077.04-.077.151 0 .19l9.316 9.316c.04.077.151.077.19 0a9.557 9.557 0 0 0 0-9.506.104.104 0 0 0-.19 0l-9.316 9.316a.104.104 0 0 1-.19 0 9.557 9.557 0 0 1 0-9.316zm.195 5.542a.104.104 0 0 0 0 .19l5.347 5.347c.04.077.151.077.19 0a7.573 7.573 0 0 0 0-5.537.104.104 0 0 0-.19 0l-5.347 5.347a.104.104 0 0 1-.19 0 7.573 7.573 0 0 1 0-5.347zm-.195 3.564a.104.104 0 0 0 0 .19l1.783 1.783c.04.077.151.077.19 0a5.584 5.584 0 0 0 0-1.973.104.104 0 0 0-.19 0l-1.783 1.783a.104.104 0 0 1-.19 0 5.584 5.584 0 0 1 0-1.783zM12 1.443a10.557 10.557 0 0 0-9.506 15.073c.04.077.151.077.19 0L12 7.2c.077-.04.077-.151 0-.19a10.557 10.557 0 0 0 0-5.567z"/>
        </svg>
      )
    }
  ];

  return (
    <>
      <CreateProjectDialog 
        open={isCreateProjectOpen} 
        onOpenChange={setIsCreateProjectOpen} 
      />
      
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-16">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-subtle" />
        
        {/* Hero Image with gradient overlay */}
        <div className="absolute inset-0">
          <img 
            src="/lovable-uploads/0e6325b0-6af7-42eb-b9fc-e2c85ed347d2.png" 
            alt="Astronauts on moon surface with laptops" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        </div>

        {/* Light beam effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] light-beam rounded-full" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            {/* Main headline */}
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-display text-gradient-subtle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
            >
              Making Open-Source Contribution{" "}
              <span className="gradient-text">Fun Again.</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            >
              Discover projects you'll love, earn achievements, and turn your contributions 
              into real rewards. Open-source has never been this exciting.
            </motion.p>

            {/* CTA buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <Link to="/sign-up">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-base bg-foreground text-background hover:bg-foreground/90 rounded-lg"
                >
                  Get Started
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsCreateProjectOpen(true)}
                className="px-8 py-6 text-base border-border hover:bg-muted rounded-lg"
              >
                Submit Your Project
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Trust section */}
        <div className="relative z-10 mt-24 border-t border-border/50">
          <div className="container mx-auto px-4 py-12">
            <p className="text-center text-sm text-muted-foreground mb-8">
              Trusted by developers from companies worldwide
            </p>
            
            {/* Logo scroll */}
            <div className="flex justify-center items-center gap-6 sm:gap-12 overflow-x-auto no-scrollbar px-4">
              {companies.map((company, index) => (
                <div 
                  key={index} 
                  className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-2 shrink-0"
                  title={company.name}
                >
                  {company.logo}
                  <span className="font-medium text-sm hidden sm:inline">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
