import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, Mail } from "lucide-react";
import { motion } from "framer-motion";

const ServerError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Fun Illustration - Broken robot */}
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
            {/* Smoke puffs */}
            <motion.circle
              cx="180"
              cy="60"
              r="15"
              fill="hsl(var(--muted))"
              opacity="0.5"
              animate={{ y: [-10, -30], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx="200"
              cy="50"
              r="10"
              fill="hsl(var(--muted))"
              opacity="0.4"
              animate={{ y: [-5, -25], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx="220"
              cy="65"
              r="12"
              fill="hsl(var(--muted))"
              opacity="0.5"
              animate={{ y: [-8, -28], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />

            {/* Robot body */}
            <rect x="150" y="120" width="100" height="80" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            
            {/* Robot head */}
            <rect x="160" y="70" width="80" height="60" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            
            {/* Antenna */}
            <line x1="200" y1="70" x2="200" y2="50" stroke="hsl(var(--border))" strokeWidth="3" />
            <circle cx="200" cy="45" r="6" fill="hsl(var(--destructive))" />
            
            {/* Eyes - X marks */}
            <g stroke="hsl(var(--destructive))" strokeWidth="3">
              <line x1="175" y1="90" x2="185" y2="100" />
              <line x1="185" y1="90" x2="175" y2="100" />
              <line x1="215" y1="90" x2="225" y2="100" />
              <line x1="225" y1="90" x2="215" y2="100" />
            </g>
            
            {/* Dizzy mouth */}
            <path d="M185 115 Q200 120 215 115" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" />
            
            {/* Arms */}
            <rect x="120" y="130" width="30" height="15" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            <rect x="250" y="130" width="30" height="15" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" transform="rotate(15 265 137)" />
            
            {/* Legs */}
            <rect x="165" y="200" width="20" height="40" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            <rect x="215" y="200" width="20" height="40" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            
            {/* Sparks */}
            <motion.g
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <polygon points="280,100 290,105 285,115 275,110" fill="hsl(var(--primary))" />
              <polygon points="290,120 298,122 295,132 287,130" fill="hsl(var(--primary))" />
            </motion.g>
            
            {/* Error badge */}
            <rect x="165" y="145" width="70" height="25" rx="4" fill="hsl(var(--destructive))" opacity="0.2" />
            <text x="200" y="163" fontSize="12" fill="hsl(var(--destructive))" textAnchor="middle" fontWeight="bold">ERROR</text>
            
            {/* 500 floating */}
            <motion.text
              x="50"
              y="230"
              fontSize="48"
              fontWeight="bold"
              fill="hsl(var(--destructive))"
              opacity="0.2"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              500
            </motion.text>
          </svg>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold text-destructive mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Server Meltdown
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Oops! Our servers are having a bit of a moment. Don't worry, our engineering 
            robots are already on it. This is on us, not you!
          </p>

          {/* Helpful suggestions */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-medium text-foreground">What can you do?</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Wait a moment and try refreshing the page</li>
              <li>• Clear your browser cache and try again</li>
              <li>• Check our status page for any ongoing issues</li>
              <li>• If the problem persists, contact our support team</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href="mailto:support@colabs.dev">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServerError;
