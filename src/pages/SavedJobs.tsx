import { useEffect, useMemo, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, Trash2 } from 'lucide-react';

interface SavedJobRow {
  id: string;
  project_id: string;
  created_at: string;
}

const SavedJobs = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SavedJobRow[]>([]);

  useEffect(() => {
    document.title = 'Saved Jobs | Colabs';
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('saved_jobs' as any)
      .select('id, project_id, created_at')
      .order('created_at', { ascending: false });
    if (!error) setItems(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [user, load]);

  const remove = async (id: string) => {
    await supabase
      .from('saved_jobs' as any)
      .delete()
      .eq('id', id);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold">Saved Jobs</h1>
            <Button asChild variant="outline" size="sm">
              <Link to="/projects">Find more jobs</Link>
            </Button>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-medium">No saved jobs</h3>
              <p className="text-xs text-muted-foreground">Jobs you save will appear here.</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {items.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Project {s.project_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      Saved {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                      <Link to={`/project/${s.project_id}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => remove(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
};

export default SavedJobs;
