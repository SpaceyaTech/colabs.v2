import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const Header = () => {
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 relative flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 32 32">
                <circle
                  cx="12"
                  cy="16"
                  r="8"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  opacity="0.9"
                />
                <circle
                  cx="20"
                  cy="16"
                  r="8"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2.5"
                  opacity="0.4"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-foreground">Colabs</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button
                onClick={() => setShowFeaturesDropdown(!showFeaturesDropdown)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center space-x-1"
              >
                <span>Features</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showFeaturesDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {showFeaturesDropdown && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-card border border-border rounded-lg shadow-xl p-2">
                  <Link
                    to="/projects"
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  >
                    Projects
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  >
                    Analytics
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  >
                    Gamification
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/organizations"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Organizations
            </Link>
            <Link
              to="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Pricing
            </Link>
            <Link
              to="/projects"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Explore
            </Link>
          </nav>

          {/* Auth buttons - desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/sign-in">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Log In
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button
                size="sm"
                className="text-sm bg-foreground text-background hover:bg-foreground/90"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] pt-12">
              <nav className="flex flex-col space-y-4">
                <SheetClose asChild>
                  <Link to="/projects" className="text-foreground text-base py-2">
                    Projects
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/organizations" className="text-foreground text-base py-2">
                    Organizations
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/pricing" className="text-foreground text-base py-2">
                    Pricing
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/dashboard" className="text-foreground text-base py-2">
                    Analytics
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/profile" className="text-foreground text-base py-2">
                    Gamification
                  </Link>
                </SheetClose>
                <div className="pt-4 border-t border-border space-y-3">
                  <SheetClose asChild>
                    <Link to="/sign-in" className="block">
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/sign-up" className="block">
                      <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                        Get Started
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {showFeaturesDropdown && (
        <button
          type="button"
          className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none p-0"
          onClick={() => setShowFeaturesDropdown(false)}
          aria-label="Close dropdown overlay"
          tabIndex={-1}
        />
      )}
    </header>
  );
};

export default Header;
