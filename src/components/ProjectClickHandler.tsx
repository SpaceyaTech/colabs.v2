import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProjectClickHandlerProps {
  children: ReactNode;
  projectId?: string;
  className?: string;
}

export const ProjectClickHandler = ({
  children,
  projectId,
  className,
}: ProjectClickHandlerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!projectId) return; // Don't navigate if no project ID

    if (!user) {
      navigate('/sign-up');
    } else {
      navigate(`/project/${projectId}`);
    }
  };

  return (
    <div onClick={handleClick} className={`cursor-pointer ${className || ''}`}>
      {children}
    </div>
  );
};
