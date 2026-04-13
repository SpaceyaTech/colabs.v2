import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { CompanyLogo } from '@/components/CompanyLogo';
import { Clock, DollarSign, MapPin, Star, Zap, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedGig {
  id: string;
  title: string;
  description: string;
  budget: { min: number; max: number; type: 'fixed' | 'hourly' };
  duration: string;
  skills: string[];
  location: string;
  company: {
    name: string;
    logo?: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
  };
  posted: string;
  proposals: number;
  difficulty: 'Entry level' | 'Intermediate' | 'Expert';
  category: string;
  isUrgent?: boolean;
  featured?: boolean;
}

interface FeaturedGigsCarouselProps {
  gigs: FeaturedGig[];
  onGigClick?: (id: string) => void;
}

export const FeaturedGigsCarousel = ({ gigs, onGigClick }: FeaturedGigsCarouselProps) => {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const featuredGigs = gigs.filter((gig) => gig.featured);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-scroll effect
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  const formatBudget = (budget: FeaturedGig['budget']) => {
    if (budget.type === 'hourly') {
      return `$${budget.min}-${budget.max}/hr`;
    }
    return `$${budget.min.toLocaleString()}-${budget.max.toLocaleString()}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Entry level':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Intermediate':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Expert':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (featuredGigs.length === 0) return null;

  return (
    <div className="relative mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Featured Opportunities</h2>
            <p className="text-sm text-muted-foreground">Premium gigs from verified companies</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {featuredGigs.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === index
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Carousel */}
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {featuredGigs.map((gig) => (
            <CarouselItem key={gig.id} className="pl-4 md:basis-1/2 lg:basis-1/2">
              <Card
                className="group relative overflow-hidden border-[0.5px] border-border/40 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
                onClick={() => {
                  if (onGigClick) {
                    onGigClick(gig.id);
                  } else {
                    navigate(`/gig/${gig.id}`);
                  }
                }}
              >
                {/* Featured Badge Ribbon */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />

                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      <CompanyLogo
                        logoUrl={gig.company.logo}
                        companyName={gig.company.name}
                        size="lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Title & Company */}
                      <div>
                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {gig.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{gig.company.name}</span>
                          {gig.company.verified && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              ✓ Verified
                            </Badge>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-0.5" />
                            {gig.company.rating}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {gig.description}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5">
                        {gig.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs bg-muted/50">
                            {skill}
                          </Badge>
                        ))}
                        {gig.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs bg-muted/50">
                            +{gig.skills.length - 4}
                          </Badge>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 font-semibold text-primary">
                            <DollarSign className="h-4 w-4" />
                            {formatBudget(gig.budget)}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {gig.duration}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {gig.location}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {gig.isUrgent && (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                              <Zap className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                          <Badge className={getDifficultyColor(gig.difficulty)}>
                            {gig.difficulty}
                          </Badge>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          {gig.proposals} proposals • Posted {gig.posted}
                        </span>
                        <Button
                          size="sm"
                          className="group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onGigClick) {
                              onGigClick(gig.id);
                            } else {
                              navigate(`/gig/${gig.id}`);
                            }
                          }}
                        >
                          View Details
                          <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious className="hidden md:flex -left-4 h-10 w-10 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background" />
        <CarouselNext className="hidden md:flex -right-4 h-10 w-10 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background" />
      </Carousel>

      {/* Mobile Dots */}
      <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
        {featuredGigs.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
