import { ReactNode } from 'react';

interface ProjectGridProps {
  children: ReactNode;
}

export function ProjectGrid({ children }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
