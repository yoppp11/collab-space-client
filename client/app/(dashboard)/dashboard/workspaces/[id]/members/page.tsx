'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  UserPlus,
  MoreVertical,
  Trash,
  Shield,
  Crown,
  User as UserIcon,
  Mail,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useWorkspaceMembers, useInviteMember, useRemoveMember } from '@/lib/api/workspaces';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { WorkspaceMembership } from '@/lib/types/workspace';

export default function WorkspaceMembersPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const currentUser = useAuthStore((state) => state.user);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'guest'>('member');

  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  const inviteMember = useInviteMember(workspaceId);
  const removeMember = useRemoveMember(workspaceId);

  const currentMembership = members.find((m) => m.user.id === currentUser?.id);
  const canManageMembers = currentMembership?.role === 'owner' || currentMembership?.role === 'admin';

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      await inviteMember.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success('Invitation sent successfully');
      setInviteEmail('');
      setIsInviteDialogOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err?.response?.data?.error?.message || 'Failed to send invitation');
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this workspace?`)) return;

    try {
      await removeMember.mutateAsync(userId);
      toast.success('Member removed successfully');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMemberName = (member: WorkspaceMembership) => {
    if (member.user.first_name || member.user.last_name) {
      return `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim();
    }
    return member.user.email;
  };

  const getInitials = (member: WorkspaceMembership) => {
    if (member.user.first_name && member.user.last_name) {
      return `${member.user.first_name[0]}${member.user.last_name[0]}`.toUpperCase();
    }
    if (member.user.email) {
      return member.user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/workspaces/${workspaceId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-muted-foreground">
              Manage workspace members and permissions
            </p>
          </div>
        </div>

        {canManageMembers && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Member to Workspace</DialogTitle>
                <DialogDescription>
                  Send an invitation to join this workspace
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as 'admin' | 'member' | 'guest')}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteMember.isPending}>
                    {inviteMember.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Send Invitation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback>{getInitials(member)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{getMemberName(member)}</h3>
                      {member.user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.user.email}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </div>

                  {canManageMembers &&
                    member.role !== 'owner' &&
                    member.user.id !== currentUser?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleRemoveMember(member.user.id, getMemberName(member))
                            }
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {members.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No members yet</h3>
              <p className="text-muted-foreground mb-4">
                Invite team members to collaborate on this workspace
              </p>
              {canManageMembers && (
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite First Member
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
