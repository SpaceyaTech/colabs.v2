import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ChevronRight, Loader2, Trash2, UserMinus, MoreVertical } from 'lucide-react';
import { CreateTeamDialog } from './CreateTeamDialog';
import { useTeams, Team } from '@/hooks/useTeams';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export function TeamsTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { teams, isLoading, deleteTeam, removeMember } = useTeams();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [membersTeam, setMembersTeam] = useState<Team | null>(null);

  const handleDeleteTeam = () => {
    if (!deleteTarget) return;
    deleteTeam.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success('Team deleted');
        setDeleteTarget(null);
      },
      onError: (err: any) => toast.error(err.message || 'Failed to delete team'),
    });
  };

  const handleRemoveMember = (memberId: string, email: string) => {
    removeMember.mutate(
      { memberId },
      {
        onSuccess: () => {
          toast.success(`Removed ${email}`);
          // Update local sheet state
          if (membersTeam) {
            setMembersTeam({
              ...membersTeam,
              members: membersTeam.members.filter((m) => m.id !== memberId),
            });
          }
        },
        onError: (err: any) => toast.error(err.message || 'Failed to remove member'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Teams</h2>
        </div>
        <div className="border border-dashed border-border rounded-lg flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No Teams Yet</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs">
            Create a team to track tasks, contributions, and blockers across your projects.
          </p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Team
          </Button>
        </div>
        <CreateTeamDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Teams</h2>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Team
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        {teams.map((team, i) => {
          const isOwner = team.created_by === user?.id;

          return (
            <div
              key={team.id}
              className={`flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors ${
                i < teams.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <button
                className="flex items-center gap-4 flex-1 min-w-0 text-left"
                onClick={() => navigate(`/dashboard/teams/${team.id}`)}
              >
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{team.name}</span>
                  {team.description && (
                    <p className="text-xs text-muted-foreground truncate">{team.description}</p>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </Badge>

                <div className="flex -space-x-1.5">
                  {team.members.slice(0, 4).map((m, j) => (
                    <Avatar key={j} className="h-5 w-5 border border-background">
                      <AvatarFallback className="text-[8px] bg-muted">
                        {m.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members.length > 4 && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      +{team.members.length - 4}
                    </span>
                  )}
                </div>

                {isOwner ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setMembersTeam(team)}>
                        <Users className="h-3.5 w-3.5 mr-2" />
                        Manage Members
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(team.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTeamDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this team?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the team, all members, and linked projects. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTeam.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Members sheet */}
      <Sheet open={!!membersTeam} onOpenChange={(open) => !open && setMembersTeam(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Members — {membersTeam?.name}</SheetTitle>
            <SheetDescription>
              {membersTeam?.members.length} member
              {(membersTeam?.members.length || 0) !== 1 ? 's' : ''}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-1">
            {membersTeam?.members.map((member) => {
              const isCurrentUser = member.user_id === user?.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 py-2 px-2 rounded hover:bg-muted/50"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {member.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{member.email}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        {member.role}
                      </Badge>
                      <Badge
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className="text-[10px] h-4 px-1"
                      >
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                  {!isCurrentUser && member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMember(member.id, member.email)}
                      disabled={removeMember.isPending}
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
