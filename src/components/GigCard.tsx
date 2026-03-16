import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, DollarSign, MapPin, Star, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GigData {
  id: string;
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  duration: string;
  skills: string[];
  location: string;
  client: {
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
  };
  posted: string;
  proposals: number;
  difficulty: 'Entry level' | 'Intermediate' | 'Expert';
  category: string;
  isUrgent?: boolean;
  featured?: boolean;
}

interface GigCardProps {
  gig: GigData;
  className?: string;
}

export function GigCard({ gig, className }: GigCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveJob = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/sign-in');
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        // Remove from saved jobs - using localStorage for now since saved_jobs table may not be in types
        localStorage.removeItem(`saved_job_${gig.id}`);
        setIsSaved(false);
        toast({
          title: "Job removed",
          description: "Job removed from your saved list",
        });
      } else {
        // Add to saved jobs - using localStorage for now since saved_jobs table may not be in types
        localStorage.setItem(`saved_job_${gig.id}`, 'true');
        
        setIsSaved(true);
        toast({
          title: "Job saved",
          description: "Job added to your saved list",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/gig/${gig.id}`);
  };

  const formatBudget = () => {
    if (gig.budget.type === 'hourly') {
      return `$${gig.budget.min}-${gig.budget.max}/hr`;
    }
    return `$${gig.budget.min.toLocaleString()}-${gig.budget.max.toLocaleString()}`;
  };

  const getDifficultyColor = () => {
    switch (gig.difficulty) {
      case 'Entry level': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card 
      className={`w-full hover:shadow-md transition-all cursor-pointer border border-border bg-card rounded-lg relative ${className}`}
      onClick={handleCardClick}
    >
      {gig.featured && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
          Featured
        </div>
      )}
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {gig.isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
              <Badge variant="outline" className={`text-xs ${getDifficultyColor()}`}>
                {gig.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground">{gig.posted}</span>
            </div>
            
            <h3 className="font-semibold text-foreground text-lg leading-tight mb-2 hover:text-primary transition-colors">
              {gig.title}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
              {gig.description}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 p-2 hover:bg-muted"
            onClick={handleSaveJob}
            disabled={isSaving}
          >
            <Bookmark 
              className={`h-4 w-4 ${isSaved ? 'fill-current text-primary' : 'text-muted-foreground'}`} 
            />
          </Button>
        </div>

        {/* Budget and Duration */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-1 text-foreground font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>{formatBudget()}</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{gig.duration}</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{gig.location}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {gig.skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {gig.skills.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{gig.skills.length - 5} more
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={gig.client.avatar} alt={gig.client.name} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {gig.client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{gig.client.name}</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {gig.client.rating} ({gig.client.reviewCount} reviews)
                </span>
                {gig.client.verified && (
                  <Badge variant="outline" className="text-xs ml-1">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {gig.proposals} proposals
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}