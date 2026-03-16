import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LogIn, ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Forbidden = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Fun Illustration - Locked vault */}
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
            {/* Guard booth */}
            <rect x="50" y="180" width="80" height="70" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            <rect x="60" y="190" width="60" height="40" fill="hsl(var(--secondary))" />
            
            {/* Guard */}
            <circle cx="90" cy="165" r="20" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            <rect x="85" y="155" width="10" height="5" fill="hsl(var(--primary))" /> {/* Hat */}
            <circle cx="83" cy="163" r="2" fill="hsl(var(--muted-foreground))" />
            <circle cx="97" cy="163" r="2" fill="hsl(var(--muted-foreground))" />
            <path d="M85 172 Q90 175 95 172" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" />
            
            {/* Vault door */}
            <rect x="180" y="100" width="140" height="150" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="3" />
            
            {/* Vault details */}
            <circle cx="250" cy="175" r="40" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="2" />
            <circle cx="250" cy="175" r="30" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            
            {/* Lock dial */}
            <circle cx="250" cy="175" r="15" fill="hsl(var(--primary))" opacity="0.2" />
            <motion.line
              x1="250"
              y1="175"
              x2="250"
              y2="160"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ rotate: [0, 45, -30, 60, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ transformOrigin: "250px 175px" }}
            />
            
            {/* Lock icon */}
            <motion.g
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <rect x="235" y="115" width="30" height="25" rx="3" fill="hsl(var(--primary))" />
              <path d="M242 115 V105 Q250 95 258 105 V115" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" />
            </motion.g>
            
            {/* Barrier */}
            <rect x="130" y="200" width="10" height="50" fill="hsl(var(--destructive))" />
            <motion.rect
              x="135"
              y="185"
              width="80"
              height="8"
              rx="2"
              fill="hsl(var(--destructive))"
              animate={{ rotate: [0, -45] }}
              transition={{ duration: 0.5 }}
              style={{ transformOrigin: "135px 189px" }}
            />
            
            {/* Stop sign */}
            <motion.g
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <polygon 
                points="340,80 360,95 360,125 340,140 320,125 320,95" 
                fill="hsl(var(--destructive))" 
              />
              <text x="340" y="118" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">STOP</text>
            </motion.g>
            
            {/* 403 */}
            <motion.text
              x="60"
              y="280"
              fontSize="32"
              fontWeight="bold"
              fill="hsl(var(--destructive))"
              opacity="0.2"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              403
            </motion.text>
          </svg>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Halt! You don't have permission to access this area. This might be 
            a restricted zone, or you may need to log in with the right credentials.
          </p>

          {/* Helpful suggestions */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-medium text-foreground">What might help:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Make sure you're logged in to the correct account</li>
              <li>• Check if your account has the required permissions</li>
              <li>• Contact the project owner for access</li>
              <li>• If you believe this is an error, reach out to support</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to="/sign-in">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
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

export default Forbidden;
