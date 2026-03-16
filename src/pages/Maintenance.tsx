import { Button } from "@/components/ui/button";
import { RefreshCw, Twitter, Mail } from "lucide-react";
import { motion } from "framer-motion";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Fun Illustration - Construction */}
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
            {/* Construction barrier stripes */}
            <rect x="80" y="200" width="240" height="40" fill="hsl(var(--primary))" opacity="0.2" rx="4" />
            <g fill="hsl(var(--primary))">
              <rect x="85" y="205" width="30" height="30" transform="skewX(-15)" />
              <rect x="135" y="205" width="30" height="30" transform="skewX(-15)" />
              <rect x="185" y="205" width="30" height="30" transform="skewX(-15)" />
              <rect x="235" y="205" width="30" height="30" transform="skewX(-15)" />
              <rect x="285" y="205" width="30" height="30" transform="skewX(-15)" />
            </g>
            
            {/* Barrier poles */}
            <rect x="90" y="180" width="10" height="60" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            <rect x="300" y="180" width="10" height="60" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            
            {/* Construction cone */}
            <polygon points="200,100 170,180 230,180" fill="hsl(var(--primary))" />
            <rect x="165" y="175" width="70" height="10" rx="2" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
            <rect x="180" y="130" width="40" height="8" fill="hsl(var(--card))" />
            <rect x="175" y="150" width="50" height="8" fill="hsl(var(--card))" />
            
            {/* Wrench */}
            <motion.g
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transformOrigin: "120px 130px" }}
            >
              <rect x="100" y="125" width="60" height="10" rx="2" fill="hsl(var(--muted-foreground))" />
              <circle cx="95" cy="130" r="15" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="8" />
              <rect x="80" y="125" width="20" height="10" fill="hsl(var(--background))" />
            </motion.g>
            
            {/* Hammer */}
            <motion.g
              animate={{ rotate: [0, -20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ transformOrigin: "280px 150px" }}
            >
              <rect x="275" y="110" width="10" height="60" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.7" />
              <rect x="260" y="100" width="40" height="20" rx="3" fill="hsl(var(--muted-foreground))" />
            </motion.g>
            
            {/* Gears */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "330px 80px" }}
            >
              <circle cx="330" cy="80" r="20" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="2" />
              <circle cx="330" cy="80" r="8" fill="hsl(var(--background))" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <rect
                  key={i}
                  x="325"
                  y="58"
                  width="10"
                  height="8"
                  fill="hsl(var(--secondary))"
                  transform={`rotate(${angle} 330 80)`}
                />
              ))}
            </motion.g>
            
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "70px 100px" }}
            >
              <circle cx="70" cy="100" r="15" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="2" />
              <circle cx="70" cy="100" r="5" fill="hsl(var(--background))" />
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <rect
                  key={i}
                  x="66"
                  y="83"
                  width="8"
                  height="6"
                  fill="hsl(var(--secondary))"
                  transform={`rotate(${angle} 70 100)`}
                />
              ))}
            </motion.g>
            
            {/* Progress bar */}
            <rect x="120" y="260" width="160" height="12" rx="6" fill="hsl(var(--secondary))" />
            <motion.rect
              x="120"
              y="260"
              width="80"
              height="12"
              rx="6"
              fill="hsl(var(--primary))"
              animate={{ width: [40, 120, 40] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </svg>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-primary mb-4">
            Under Maintenance
          </h1>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            We're Making Things Better
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We're currently performing scheduled maintenance to improve your experience. 
            We'll be back shortly. Thanks for your patience!
          </p>

          {/* Status info */}
          <div className="bg-card border border-border rounded-lg p-4 mb-8 inline-block">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-muted-foreground">Estimated downtime:</span>
              <span className="text-foreground font-medium">~30 minutes</span>
            </div>
          </div>

          {/* Helpful info */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-medium text-foreground">While you wait:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Follow us on Twitter for real-time updates</li>
              <li>• Check our status page for progress</li>
              <li>• Grab a coffee ☕ – we'll be right back!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
            <Button variant="outline" asChild>
              <a href="https://twitter.com/colabs" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4 mr-2" />
                Follow Updates
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="mailto:support@colabs.dev">
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Maintenance;
