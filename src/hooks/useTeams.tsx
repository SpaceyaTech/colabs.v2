import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: TeamMember[];
  projects: TeamProject[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string | null;
  email: string;
  role: string;
  status: string;
  joined_at: string;
}

export interface TeamProject {
  id: string;
  team_id: string;
  project_id: string;
  added_at: string;
}

interface CreateTeamInput {
  name: string;
  description: string;
  emails: string[];
  projectIds: string[];
}

export function useTeams() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch members and projects for each team
      const teamsWithRelations: Team[] = await Promise.all(
        (teams || []).map(async (team: any) => {
          const [membersRes, projectsRes] = await Promise.all([
            supabase.from('team_members').select('*').eq('team_id', team.id),
            supabase.from('team_projects').select('*').eq('team_id', team.id),
          ]);

          return {
            ...team,
            members: membersRes.data || [],
            projects: projectsRes.data || [],
          };
        })
      );

      return teamsWithRelations;
    },
    enabled: !!user,
  });

  const createTeam = useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ name: input.name, description: input.description || null, created_by: user.id })
        .select()
        .single();

      if (teamError) throw teamError;

      await supabase.from('team_members').insert({
        team_id: team.id,
        user_id: user.id,
        email: user.email!,
        role: 'owner',
        status: 'active',
      });

      if (input.emails.length > 0) {
        await supabase.from('team_members').insert(
          input.emails.map((email) => ({
            team_id: team.id,
            email,
            role: 'member',
            status: 'pending',
          }))
        );
      }

      if (input.projectIds.length > 0) {
        await supabase.from('team_projects').insert(
          input.projectIds.map((project_id) => ({
            team_id: team.id,
            project_id,
          }))
        );
      }

      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ memberId }: { memberId: string }) => {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  return {
    teams: teamsQuery.data || [],
    isLoading: teamsQuery.isLoading,
    createTeam,
    deleteTeam,
    removeMember,
  };
}
