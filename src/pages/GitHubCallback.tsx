import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGitHub } from '@/hooks/useGitHub';
import { Loader2 } from 'lucide-react';

const GitHubCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useGitHub();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('GitHub OAuth error:', error);
      navigate('/dashboard?error=github_oauth_failed');
      return;
    }

    if (code && state) {
      handleOAuthCallback(code, state).then(() => {
        navigate('/dashboard?tab=github');
      });
    } else {
      navigate('/dashboard');
    }
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Connecting to GitHub...</h2>
        <p className="text-muted-foreground">Please wait while we complete your GitHub integration.</p>
      </div>
    </div>
  );
};

export default GitHubCallback;