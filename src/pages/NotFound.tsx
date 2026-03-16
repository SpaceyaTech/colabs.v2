import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Fun Illustration - Lost astronaut */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full max-w-md mx-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stars background */}
            <circle cx="50" cy="50" r="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
            <circle cx="350" cy="80" r="1.5" fill="hsl(var(--muted-foreground))" opacity="0.4" />
            <circle cx="100" cy="120" r="1" fill="hsl(var(--muted-foreground))" opacity="0.6" />
            <circle cx="300" cy="40" r="2" fill="hsl(var(--muted-foreground))" opacity="0.3" />
            <circle cx="380" cy="200" r="1.5" fill="hsl(var(--muted-foreground))" opacity="0.5" />
            <circle cx="20" cy="180" r="1" fill="hsl(var(--muted-foreground))" opacity="0.4" />
            <circle cx="150" cy="30" r="1.5" fill="hsl(var(--muted-foreground))" opacity="0.5" />
            <circle cx="250" cy="250" r="2" fill="hsl(var(--muted-foreground))" opacity="0.3" />
            
            {/* Planet */}
            <circle cx="320" cy="220" r="45" fill="hsl(var(--secondary))" />
            <ellipse cx="320" cy="220" rx="55" ry="12" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" opacity="0.6" />
            
            {/* Astronaut body */}
            <ellipse cx="180" cy="160" rx="35" ry="45" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            
            {/* Astronaut helmet */}
            <circle cx="180" cy="100" r="40" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            <circle cx="180" cy="100" r="28" fill="hsl(var(--secondary))" />
            
            {/* Visor reflection */}
            <path d="M160 90 Q170 85 185 92" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" opacity="0.6" />
            
            {/* Confused face in visor */}
            <circle cx="170" cy="98" r="3" fill="hsl(var(--muted-foreground))" />
            <circle cx="190" cy="98" r="3" fill="hsl(var(--muted-foreground))" />
            <path d="M168 112 Q180 108 192 112" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" />
            
            {/* Arms */}
            <ellipse cx="130" cy="150" rx="15" ry="25" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" transform="rotate(-20 130 150)" />
            <ellipse cx="230" cy="145" rx="15" ry="25" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" transform="rotate(25 230 145)" />
            
            {/* Question mark floating */}
            <motion.g
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <text x="250" y="80" fontSize="40" fill="hsl(var(--primary))" fontWeight="bold">?</text>
            </motion.g>
            
            {/* Floating "404" text */}
            <motion.text
              x="60"
              y="230"
              fontSize="48"
              fontWeight="bold"
              fill="hsl(var(--primary))"
              opacity="0.3"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              404
            </motion.text>
          </svg>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Lost in Space
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Houston, we have a problem! The page you're looking for has drifted off into the cosmos. 
            It might have been moved, deleted, or perhaps it never existed.
          </p>

          {/* Attempted URL */}
          <div className="bg-card border border-border rounded-lg p-3 mb-8 inline-block">
            <code className="text-sm text-muted-foreground">
              {location.pathname}
            </code>
          </div>

          {/* Helpful suggestions */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-medium text-foreground">Here's what you can do:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Double-check the URL for typos</li>
              <li>• Use the search to find what you're looking for</li>
              <li>• Head back to the dashboard</li>
              <li>• Contact support if you think this is an error</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/projects">
                <Search className="h-4 w-4 mr-2" />
                Browse Projects
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
