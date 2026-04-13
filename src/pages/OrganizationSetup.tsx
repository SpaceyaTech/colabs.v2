import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AuthGuard } from '@/components/AuthGuard';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Github,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Folder,
  GitBranch,
  AlertCircle,
} from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  stargazers_count: number;
  language: string;
  updated_at: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

const OrganizationSetup = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOrganization = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setOrganization(data);

      // Check if GitHub is already connected
      const { data: integration } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('organization_id', data.id)
        .eq('integration_type', 'github')
        .single();

      if (integration) {
        setIsConnected(true);
        // In a real app, you'd fetch repos from GitHub API
        // For demo, we'll show some mock repositories
        setRepositories([
          {
            id: 1,
            name: 'frontend-app',
            full_name: 'acme/frontend-app',
            description: 'React frontend application',
            private: false,
            stargazers_count: 25,
            language: 'TypeScript',
            updated_at: '2024-01-15T10:30:00Z',
          },
          {
            id: 2,
            name: 'api-server',
            full_name: 'acme/api-server',
            description: 'Node.js API server',
            private: true,
            stargazers_count: 8,
            language: 'JavaScript',
            updated_at: '2024-01-14T14:20:00Z',
          },
          {
            id: 3,
            name: 'mobile-app',
            full_name: 'acme/mobile-app',
            description: 'React Native mobile application',
            private: false,
            stargazers_count: 42,
            language: 'TypeScript',
            updated_at: '2024-01-13T09:15:00Z',
          },
        ]);
      }
    } catch (error: any) {
      console.error('Organization fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organization details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug && user) {
      fetchOrganization();
    }
  }, [slug, user, fetchOrganization]);

  const connectGitHub = async () => {
    if (!organization) return;

    setConnecting(true);
    try {
      // In a real app, this would redirect to GitHub OAuth
      // For demo, we'll simulate the connection
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { error } = await supabase.from('organization_integrations').insert({
        organization_id: organization.id,
        integration_type: 'github',
        integration_name: 'GitHub',
        config: { connected: true },
        connected_by: user?.id || '',
      });

      if (error) throw error;

      setIsConnected(true);
      // Simulate fetching repositories
      setRepositories([
        {
          id: 1,
          name: 'frontend-app',
          full_name: 'acme/frontend-app',
          description: 'React frontend application',
          private: false,
          stargazers_count: 25,
          language: 'TypeScript',
          updated_at: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          name: 'api-server',
          full_name: 'acme/api-server',
          description: 'Node.js API server',
          private: true,
          stargazers_count: 8,
          language: 'JavaScript',
          updated_at: '2024-01-14T14:20:00Z',
        },
        {
          id: 3,
          name: 'mobile-app',
          full_name: 'acme/mobile-app',
          description: 'React Native mobile application',
          private: false,
          stargazers_count: 42,
          language: 'TypeScript',
          updated_at: '2024-01-13T09:15:00Z',
        },
      ]);

      toast({
        title: 'GitHub connected!',
        description:
          'Successfully connected your GitHub account. Now select repositories to monitor.',
      });
    } catch (error: any) {
      console.error('GitHub connection error:', error);
      toast({
        title: 'Connection failed',
        description: 'Unable to connect GitHub. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleRepoToggle = (repoId: number) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId);
    } else {
      newSelected.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  const saveConfiguration = async () => {
    if (!organization || selectedRepos.size === 0) {
      toast({
        title: 'No repositories selected',
        description: 'Please select at least one repository to monitor.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // In a real app, you'd save the selected repos to the database
      // For demo, we'll just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: 'Setup complete!',
        description: `Successfully configured monitoring for ${selectedRepos.size} repositories.`,
      });

      navigate(`/organizations/${organization.slug}`);
    } catch (error: any) {
      console.error('Save configuration error:', error);
      toast({
        title: 'Save failed',
        description: 'Unable to save configuration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading organization...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4"
                onClick={() => navigate('/organizations')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Organizations
              </Button>
              <h1 className="text-3xl font-bold mb-2">Setup {organization?.name}</h1>
              <p className="text-muted-foreground">
                Connect your GitHub account and select repositories to monitor
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-sm font-medium">Organization Created</span>
                </div>
                <div className="w-16 h-0.5 bg-muted"></div>
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                  )}
                  <span className="text-sm font-medium">Connect GitHub</span>
                </div>
                <div className="w-16 h-0.5 bg-muted"></div>
                <div className="flex items-center space-x-2">
                  {selectedRepos.size > 0 ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30"></div>
                  )}
                  <span className="text-sm font-medium">Select Repositories</span>
                </div>
              </div>
            </div>

            {isConnected ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Github className="h-5 w-5" />
                      Select Repositories to Monitor
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Choose the repositories you want to track for issues, pull requests, and
                      automated workflows
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {repositories.map((repo) => (
                        <div
                          key={repo.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <Checkbox
                              checked={selectedRepos.has(repo.id)}
                              onCheckedChange={() => handleRepoToggle(repo.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{repo.name}</h4>
                                {repo.private && (
                                  <Badge variant="secondary" className="text-xs">
                                    Private
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {repo.language}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {repo.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>⭐ {repo.stargazers_count}</span>
                                <span>
                                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedRepos.size} of {repositories.length} repositories selected
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/organizations/${organization?.slug}`)}
                    >
                      Skip for now
                    </Button>
                    <Button
                      onClick={saveConfiguration}
                      disabled={saving || selectedRepos.size === 0}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        `Continue with ${selectedRepos.size} repositories`
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Github className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Connect your GitHub account</CardTitle>
                  <p className="text-muted-foreground">
                    Connect GitHub to monitor repositories, track issues, and automate workflows
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Folder className="h-8 w-8 text-blue-500" />
                      <h4 className="font-semibold">Repository Sync</h4>
                      <p className="text-xs text-muted-foreground">Monitor commits and releases</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-orange-500" />
                      <h4 className="font-semibold">Issue Tracking</h4>
                      <p className="text-xs text-muted-foreground">Track and manage issues</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <GitBranch className="h-8 w-8 text-green-500" />
                      <h4 className="font-semibold">PR Notifications</h4>
                      <p className="text-xs text-muted-foreground">Get notified on pull requests</p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={connectGitHub}
                    disabled={connecting}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Github className="h-4 w-4 mr-2" />
                        Connect with GitHub
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default OrganizationSetup;
