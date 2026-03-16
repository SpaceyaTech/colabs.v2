import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration Container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <div className="relative w-24 h-24 rounded-full bg-muted/50 border border-border/40 flex items-center justify-center">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary/20" />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-primary/30" />
        <div className="absolute top-1/2 -right-6 w-2 h-2 rounded-full bg-muted-foreground/20" />
      </div>

      {/* Text Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
