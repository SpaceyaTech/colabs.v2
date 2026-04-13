import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FolderGit2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { ProjectCard } from '@/components/ProjectCard';

interface Project {
  id: string;
  name: string;
  owner: string;
  language: string;
  stars: number;
  forks: number;
  description: string;
  topics: string[];
  role: 'owner' | 'contributor' | 'maintainer';
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'react',
    owner: 'facebook',
    language: 'TypeScript',
    stars: 218000,
    forks: 45000,
    description: 'The library for web and native user interfaces.',
    topics: ['react', 'javascript', 'ui', 'frontend'],
    role: 'contributor',
  },
  {
    id: '2',
    name: 'next.js',
    owner: 'vercel',
    language: 'TypeScript',
    stars: 115000,
    forks: 25000,
    description: 'The React Framework for the Web.',
    topics: ['nextjs', 'react', 'framework'],
    role: 'contributor',
  },
  {
    id: '3',
    name: 'my-oss-project',
    owner: 'user',
    language: 'Python',
    stars: 342,
    forks: 56,
    description: 'An open source project for developers.',
    topics: ['python', 'automation', 'cli'],
    role: 'owner',
  },
  {
    id: '4',
    name: 'supabase',
    owner: 'supabase',
    language: 'TypeScript',
    stars: 58000,
    forks: 5200,
    description: 'The open source Firebase alternative.',
    topics: ['database', 'backend', 'postgres'],
    role: 'contributor',
  },
  {
    id: '5',
    name: 'tailwindcss',
    owner: 'tailwindlabs',
    language: 'TypeScript',
    stars: 75000,
    forks: 3800,
    description: 'A utility-first CSS framework for rapid UI development.',
    topics: ['css', 'tailwind', 'frontend'],
    role: 'maintainer',
  },
];

export function ProjectsTab() {
  const navigate = useNavigate();
  // For demo: set to [] to see empty state
  const projects = mockProjects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">OSS Projects</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
          Explore More
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Connect your GitHub account or explore open source projects to start contributing."
          actionLabel="Explore Projects"
          onAction={() => navigate('/projects')}
        />
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              name={project.name}
              description={project.description}
              owner={project.owner}
              language={project.language}
              stars={project.stars}
              forks={project.forks}
              role={project.role}
              technologies={project.topics}
              githubUrl={`https://github.com/${project.owner}/${project.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
