import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';

interface ProposalRow {
  id: string;
  created_at: string;
  status: string;
  payment_type: string;
  total_amount: number | null;
  total_duration: string | null;
  project_id: string;
}

const MyProposals = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ProposalRow[]>([]);

  useEffect(() => {
    document.title = 'My Proposals | Colabs';
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('proposals' as any)
        .select('id, created_at, status, payment_type, total_amount, total_duration, project_id')
        .order('created_at', { ascending: false });
      if (!error) setItems(data as any);
      setLoading(false);
    };
    run();
  }, [user]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold">My Proposals</h1>
            <Button asChild variant="outline" size="sm">
              <Link to="/projects">Browse projects</Link>
            </Button>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-medium">No proposals yet</h3>
              <p className="text-xs text-muted-foreground">
                Proposals you submit will appear here.
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {items.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Project {p.project_id.slice(0, 8)}
                      </span>
                      <Badge
                        variant={getStatusVariant(p.status)}
                        className="text-[10px] capitalize"
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      <span>{p.payment_type}</span>
                      {p.total_amount != null && <span>${p.total_amount}</span>}
                      {p.total_duration && <span>{p.total_duration}</span>}
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                    <Link to={`/project/${p.project_id}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
};

export default MyProposals;
