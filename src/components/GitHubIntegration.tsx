import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Github,
  Star,
  GitFork,
  RefreshCw,
  Unlink,
  ExternalLink,
  CheckCircle,
  Users,
} from 'lucide-react';
import { useGitHub } from '@/hooks/useGitHub';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const GitHubIntegration = () => {
  const { user } = useAuth();
  const {
    loading,
    integration,
    repositories,
    connectToGitHub,
    disconnectGitHub,
    syncRepositories,
    updateRepositoryCollaboration,
    checkIntegration,
    loadRepositories,
  } = useGitHub();

  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      checkIntegration();
    }
  }, [user, checkIntegration]);

  useEffect(() => {
    if (integration) {
      loadRepositories();
    }
  }, [integration, loadRepositories]);

  const handleRepoToggle = async (repoId: string, enabled: boolean) => {
    await updateRepositoryCollaboration([repoId], enabled);
  };

  const handleBulkUpdate = async (enabled: boolean) => {
    if (selectedRepos.size > 0) {
      await updateRepositoryCollaboration(Array.from(selectedRepos), enabled);
      setSelectedRepos(new Set());
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please sign in to connect GitHub</p>
        </CardContent>
      </Card>
    );
  }

  if (!integration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect GitHub
          </CardTitle>
          <CardDescription>
            Connect your GitHub account to sync repositories and enable collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectToGitHub} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub Integration
              </CardTitle>
              <CardDescription>
                Connected as{' '}
                <span className="font-medium text-foreground">{integration.github_username}</span>
              </CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {integration.avatar_url && (
                <img
                  src={integration.avatar_url}
                  alt={integration.github_username}
                  className="h-12 w-12 rounded-full border-2 border-border"
                />
              )}
              <div>
                <p className="font-medium">{integration.github_username}</p>
                <p className="text-sm text-muted-foreground">
                  Connected on {new Date(integration.connected_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={syncRepositories} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Repos
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect GitHub?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will disconnect your GitHub account and disable all repository
                      collaborations. You can reconnect at any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={disconnectGitHub}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repository Management */}
      <Card>
        <CardHeader>
          <CardTitle>Repository Management</CardTitle>
          <CardDescription>
            Enable collaboration on your repositories. People can request to join enabled repos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {repositories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No repositories found. Try syncing your repos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Actions */}
              {selectedRepos.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedRepos.size} repositories selected
                  </span>
                  <Button size="sm" onClick={() => handleBulkUpdate(true)}>
                    Enable Collaboration
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkUpdate(false)}>
                    Disable Collaboration
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedRepos(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              )}

              {/* Repository List */}
              <div className="space-y-3">
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={selectedRepos.has(repo.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedRepos);
                          if (checked) {
                            newSelected.add(repo.id);
                          } else {
                            newSelected.delete(repo.id);
                          }
                          setSelectedRepos(newSelected);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium truncate">{repo.name}</h4>
                          <Badge
                            variant={repo.visibility === 'private' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {repo.visibility}
                          </Badge>
                          {repo.allow_collaboration && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                              Collaboration Enabled
                            </Badge>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              {repo.language}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {repo.stars_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            {repo.forks_count}
                          </div>
                          {repo.collaboration_requests_count !== undefined &&
                            repo.collaboration_requests_count > 0 && (
                              <div className="flex items-center gap-1 text-primary font-medium">
                                <Users className="h-3 w-3" />
                                {repo.collaboration_requests_count}{' '}
                                {repo.collaboration_requests_count === 1 ? 'request' : 'requests'}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {repo.allow_collaboration ? 'Enabled' : 'Disabled'}
                        </span>
                        <Switch
                          checked={repo.allow_collaboration}
                          onCheckedChange={(enabled) => handleRepoToggle(repo.id, enabled)}
                          disabled={loading}
                        />
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
