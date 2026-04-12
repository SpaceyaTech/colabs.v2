import { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AuthGuard } from '@/components/AuthGuard';
import {
  Settings,
  Users,
  Workflow,
  Activity,
  Plus,
  Slack,
  Github,
  Zap,
  Figma,
  ArrowLeft,
  Building,
  Globe,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  website_url: string;
  created_at: string;
}

interface OrganizationMember {
  id: string;
  role: string;
  joined_at: string;
}

interface Integration {
  id: string;
  integration_type: string;
  integration_name: string;
  is_active: boolean;
  connected_at: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  is_active: boolean;
  created_at: string;
}

const OrganizationDashboard = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizationData = useCallback(async () => {
    try {
      // Fetch organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Fetch user role
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgData.id)
        .eq('user_id', user?.id)
        .single();

      if (memberError) throw memberError;
      setUserRole(memberData.role);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgData.id);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Fetch integrations
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('organization_id', orgData.id);

      if (integrationsError) throw integrationsError;
      setIntegrations(integrationsData || []);

      // Fetch workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('organization_workflows')
        .select('*')
        .eq('organization_id', orgData.id);

      if (workflowsError) throw workflowsError;
      setWorkflows(workflowsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load organization data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    if (slug && user) {
      fetchOrganizationData();
    }
  }, [slug, user, fetchOrganizationData]);

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return Slack;
      case 'github':
        return Github;
      case 'clickup':
        return Zap;
      case 'figma':
        return Figma;
      default:
        return Zap;
    }
  };

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'slack':
        return 'bg-green-500';
      case 'github':
        return 'bg-gray-900';
      case 'clickup':
        return 'bg-blue-500';
      case 'figma':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading organization...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!organization) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold mb-2">Organization not found</h1>
            <p className="text-muted-foreground mb-4">
              The organization you're looking for doesn't exist.
            </p>
            <Button asChild>
              <NavLink to="/organizations">Browse Organizations</NavLink>
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <NavLink to="/organizations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Organizations
              </NavLink>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold">{organization.name}</h1>
                  <Badge variant="secondary">{userRole}</Badge>
                </div>
                <p className="text-muted-foreground">{organization.description}</p>
                {organization.website_url && (
                  <div className="flex items-center gap-2 mt-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={organization.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {organization.website_url}
                    </a>
                  </div>
                )}
              </div>

              {(userRole === 'owner' || userRole === 'admin') && (
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold">{members.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Integrations</p>
                    <p className="text-2xl font-bold">{integrations.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Workflows</p>
                    <p className="text-2xl font-bold">{workflows.length}</p>
                  </div>
                  <Workflow className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Workflows</p>
                    <p className="text-2xl font-bold">
                      {workflows.filter(w => w.is_active).length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Setup */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-6 flex-col space-y-2">
                      <Slack className="h-8 w-8 text-green-500" />
                      <span>Connect Slack</span>
                      <p className="text-xs text-muted-foreground text-center">
                        Get notifications and manage workflows
                      </p>
                    </Button>

                    <Button variant="outline" className="h-auto p-6 flex-col space-y-2">
                      <Github className="h-8 w-8 text-gray-700" />
                      <span>Connect GitHub</span>
                      <p className="text-xs text-muted-foreground text-center">
                        Sync repositories and track issues
                      </p>
                    </Button>

                    <Button variant="outline" className="h-auto p-6 flex-col space-y-2">
                      <Zap className="h-8 w-8 text-blue-500" />
                      <span>Connect ClickUp</span>
                      <p className="text-xs text-muted-foreground text-center">
                        Manage tasks and project tracking
                      </p>
                    </Button>

                    <Button variant="outline" className="h-auto p-6 flex-col space-y-2">
                      <Figma className="h-8 w-8 text-purple-500" />
                      <span>Connect Figma</span>
                      <p className="text-xs text-muted-foreground text-center">
                        Track design changes and collaborate
                      </p>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Organization created</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(organization.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {integrations.length === 0 && workflows.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No activity yet. Start by connecting your first integration!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Integrations</h2>
                {(userRole === 'owner' || userRole === 'admin') && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map(integration => {
                  const Icon = getIntegrationIcon(integration.integration_type);
                  const colorClass = getIntegrationColor(integration.integration_type);

                  return (
                    <Card key={integration.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}
                          >
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold capitalize">
                              {integration.integration_type}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {integration.integration_name}
                            </p>
                          </div>
                          {integration.is_active ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Connected {new Date(integration.connected_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}

                {integrations.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No integrations connected yet. Start connecting your tools to automate
                      workflows!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="workflows" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Workflows</h2>
                {(userRole === 'owner' || userRole === 'admin') && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {workflows.map(workflow => (
                  <Card key={workflow.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{workflow.name}</h3>
                            {workflow.is_active ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {workflow.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Trigger: {workflow.trigger_type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>
                              Created {new Date(workflow.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {workflows.length === 0 && (
                  <div className="text-center py-12">
                    <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No workflows created yet. Create your first workflow to automate tasks!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Members</h2>
                {(userRole === 'owner' || userRole === 'admin') && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {members.map(member => (
                  <Card key={member.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Member</p>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                          {userRole === 'owner' && member.role !== 'owner' && (
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default OrganizationDashboard;
