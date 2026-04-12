import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AppLayout } from '@/components/AppLayout';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { IssuesTab } from '@/components/dashboard/IssuesTab';
import { ProjectsTab } from '@/components/dashboard/ProjectsTab';
import { GigsTab } from '@/components/dashboard/GigsTab';
import { TeamsTab } from '@/components/dashboard/TeamsTab';
import { TeamWorkspace } from '@/components/dashboard/TeamWorkspace';
import { AnalyticsTab } from '@/components/dashboard/AnalyticsTab';
import { SettingsTab } from '@/components/dashboard/SettingsTab';
import AIChat from '@/components/AIChat';

interface Project {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  technologies: string[];
  project_type: string;
  visibility: string;
  is_paid: boolean;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProjects();
      } else {
        navigate('/sign-up');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProjects();
      } else {
        navigate('/sign-up');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .in('visibility', ['public', 'unlisted'])
      .order('created_at', { ascending: false })
      .limit(10);
    setProjects(data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Routes>
          <Route index element={<IssuesTab />} />
          <Route path="projects" element={<ProjectsTab />} />
          <Route path="gigs" element={<GigsTab />} />
          <Route path="teams" element={<TeamsTab />} />
          <Route path="teams/:teamId" element={<TeamWorkspace />} />
          <Route path="analytics" element={<AnalyticsTab />} />
          <Route path="settings" element={<SettingsTab />} />
        </Routes>
      </div>
      <AIChat />
    </AppLayout>
  );
};

export default Dashboard;
