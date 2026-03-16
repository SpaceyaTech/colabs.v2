import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  logoUrl?: string | null;
  companyName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Colabs placeholder logo - a subtle, professional neutral design
const ColabsPlaceholder = ({ size }: { size: "sm" | "md" | "lg" }) => {
  const dimensions = {
    sm: { width: 32, height: 32, stroke: 1.5 },
    md: { width: 40, height: 40, stroke: 1.5 },
    lg: { width: 48, height: 48, stroke: 2 },
  };

  const { width, height, stroke } = dimensions[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground"
    >
      {/* Background circle */}
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--border))"
        strokeWidth={stroke}
      />
      {/* Colabs "C" logo mark */}
      <path
        d="M24 14C22.8 12.8 21.2 12 19.5 12C15.9 12 13 15.1 13 19C13 22.9 15.9 26 19.5 26C21.2 26 22.8 25.2 24 24"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
      />
      {/* Connection dots - representing collaboration */}
      <circle cx="26" cy="14" r="2" fill="hsl(var(--primary))" />
      <circle cx="26" cy="24" r="2" fill="hsl(var(--primary))" />
      <circle cx="27" cy="19" r="1.5" fill="hsl(var(--primary))" opacity="0.6" />
    </svg>
  );
};

export function CompanyLogo({ logoUrl, companyName, size = "md", className }: CompanyLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  if (!logoUrl) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <ColabsPlaceholder size={size} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden bg-muted border border-border/40 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          // Replace with placeholder on error
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement?.classList.add("fallback-active");
        }}
      />
    </div>
  );
}

// Neutral company logos for demo purposes
export const NeutralLogos = {
  tech: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="hsl(var(--muted))" />
      <path d="M8 16H24M16 8V24" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  startup: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="hsl(var(--muted))" />
      <path d="M16 8L24 24H8L16 8Z" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  enterprise: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="hsl(var(--muted))" />
      <rect x="10" y="10" width="12" height="12" rx="2" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" />
    </svg>
  ),
  creative: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="hsl(var(--muted))" />
      <circle cx="16" cy="16" r="6" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" />
    </svg>
  ),
};
