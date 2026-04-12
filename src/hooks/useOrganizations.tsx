import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar_url: string;
  website_url: string;
  created_at: string;
  role?: string; // User's role in this organization
}

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('organization_members')
        .select(
          `
          role,
          organizations (
            id,
            name,
            slug,
            description,
            avatar_url,
            website_url,
            created_at
          )
        `
        )
        .eq('user_id', user?.id);

      if (error) throw error;

      const orgsWithRole =
        data?.map(item => ({
          ...item.organizations,
          role: item.role,
        })) || [];

      setOrganizations(orgsWithRole);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserOrganizations();
    } else {
      setOrganizations([]);
      setLoading(false);
    }
  }, [user, fetchUserOrganizations]);

  const createOrganization = async (orgData: {
    name: string;
    slug: string;
    description?: string;
    website_url?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single();

    if (orgError) throw orgError;

    // Add user as owner
    const { error: memberError } = await supabase.from('organization_members').insert({
      organization_id: organization.id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) throw memberError;

    // Refresh the list
    await fetchUserOrganizations();
    return organization;
  };

  const joinOrganization = async (organizationId: string, role: 'member' | 'admin' = 'member') => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('organization_members').insert({
      organization_id: organizationId,
      user_id: user.id,
      role,
    });

    if (error) throw error;

    // Refresh the list
    await fetchUserOrganizations();
  };

  const leaveOrganization = async (organizationId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Refresh the list
    await fetchUserOrganizations();
  };

  return {
    organizations,
    loading,
    error,
    createOrganization,
    joinOrganization,
    leaveOrganization,
    refetch: fetchUserOrganizations,
  };
};
