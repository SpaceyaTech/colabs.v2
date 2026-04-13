import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompanyLogo } from '@/components/CompanyLogo';
import { CreateGigDialog } from '@/components/CreateGigDialog';
import { cn } from '@/lib/utils';
import { useMyGigs, type GigRow } from '@/hooks/useGigs';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  Package,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

type SoftwareStatus = 'published' | 'draft' | 'archived';

interface PostedSoftware {
  id: string;
  name: string;
  description: string;
  price: string;
  sales: number;
  downloads: number;
  revenue: string;
  status: SoftwareStatus;
  publishedAt: string;
}

const mockSoftware: PostedSoftware[] = [
  {
    id: '1',
    name: 'DevFlow Pro',
    description: 'Advanced project management for developers',
    price: '$49',
    sales: 234,
    downloads: 1250,
    revenue: '$11,466',
    status: 'published',
    publishedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'CodeSnap',
    description: 'Beautiful code screenshots in seconds',
    price: '$19',
    sales: 567,
    downloads: 3400,
    revenue: '$10,773',
    status: 'published',
    publishedAt: '2023-12-15',
  },
  {
    id: '3',
    name: 'API Monitor',
    description: 'Real-time API health monitoring dashboard',
    price: '$29',
    sales: 0,
    downloads: 0,
    revenue: '$0',
    status: 'draft',
    publishedAt: '',
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  paused: { label: 'Paused', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
  published: {
    label: 'Published',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground' },
};

const tabs = [
  { id: 'gigs', label: 'My Gigs', icon: Briefcase },
  { id: 'software', label: 'My Software', icon: Package },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('gigs');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<GigRow | null>(null);
  const { user } = useAuth();
  const { data: allGigs, isLoading } = useMyGigs(user?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filter to only user's gigs
  const myGigs = allGigs ?? [];

  const gigStats = {
    totalGigs: myGigs.length,
    activeGigs: myGigs.filter((g) => g.status === 'active').length,
    totalApplications: myGigs.reduce((sum, g) => sum + (g.proposals_count ?? 0), 0),
    totalViews: 0,
  };

  const softwareStats = {
    totalProducts: mockSoftware.length,
    published: mockSoftware.filter((s) => s.status === 'published').length,
    totalSales: mockSoftware.reduce((sum, s) => sum + s.sales, 0),
    totalRevenue: mockSoftware.reduce(
      (sum, s) => sum + parseFloat(s.revenue.replace(/[$,]/g, '')),
      0
    ),
  };

  const handleDeleteGig = async (id: string) => {
    const { error } = await supabase.from('gigs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Gig deleted' });
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('gigs').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Gig ${newStatus}` });
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">Seller Dashboard</h1>
          <Button size="sm" onClick={() => (activeTab === 'gigs' ? setCreateOpen(true) : null)}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'gigs' ? 'Post New Gig' : 'Add Software'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors',
                activeTab === id
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {(activeTab === 'gigs'
            ? [
                { icon: Briefcase, label: 'Total Gigs', value: gigStats.totalGigs },
                { icon: CheckCircle2, label: 'Active', value: gigStats.activeGigs },
                { icon: Users, label: 'Applications', value: gigStats.totalApplications },
                { icon: Eye, label: 'Views', value: gigStats.totalViews },
              ]
            : [
                { icon: Package, label: 'Products', value: softwareStats.totalProducts },
                { icon: CheckCircle2, label: 'Published', value: softwareStats.published },
                { icon: Users, label: 'Sales', value: softwareStats.totalSales },
                {
                  icon: DollarSign,
                  label: 'Revenue',
                  value: `$${softwareStats.totalRevenue.toLocaleString()}`,
                },
              ]
          ).map(({ icon: Icon, label, value }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Gigs List */}
        {activeTab === 'gigs' ? (
          <div className="border border-border rounded-lg divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="w-9 h-9 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))
            ) : myGigs.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground text-sm">
                No gigs posted yet. Click "Post New Gig" to get started.
              </div>
            ) : (
              myGigs.map((gig) => (
                <div
                  key={gig.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <CompanyLogo
                    companyName={gig.company}
                    logoUrl={gig.company_logo ?? undefined}
                    size="md"
                  />
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/gig/${gig.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{gig.title}</span>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px]', statusConfig[gig.status]?.className)}
                      >
                        {statusConfig[gig.status]?.label ?? gig.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{gig.company}</span>
                      <span>{gig.budget}</span>
                      <span>{gig.proposals_count} proposals</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/gig/${gig.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingGig(gig);
                          setCreateOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(gig.id, gig.status)}>
                        {gig.status === 'active' ? (
                          <>
                            <PauseCircle className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteGig(gig.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border">
            {mockSoftware.map((sw) => (
              <div
                key={sw.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-9 h-9 rounded bg-muted flex items-center justify-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{sw.name}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px]', statusConfig[sw.status].className)}
                    >
                      {statusConfig[sw.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{sw.price}</span>
                    <span>{sw.sales} sales</span>
                    <span>{sw.revenue} revenue</span>
                    <span>{sw.downloads} downloads</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {sw.status === 'draft' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Publish
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Unpublish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateGigDialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) setEditingGig(null);
        }}
        editGig={editingGig}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['gigs'] })}
      />
    </AppLayout>
  );
}
