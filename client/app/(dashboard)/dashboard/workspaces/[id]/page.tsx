'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Users,
  Settings,
  Plus,
  FileText,
  LayoutGrid,
  MoreVertical,
  Edit,
  Trash,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useWorkspace, useBoards, useDeleteWorkspace } from '@/lib/api/workspaces';
import { useDocuments } from '@/lib/api/documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateBoardDialog } from '@/components/workspaces/create-board-dialog';
import { InviteMemberDialog } from '@/components/workspaces/invite-member-dialog';

export default function WorkspaceDetailPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);

  const { data: workspace, isLoading: loadingWorkspace } = useWorkspace(workspaceId);
  const { data: boards } = useBoards(workspaceId);
  const { data: documents } = useDocuments(workspaceId);
  const deleteWorkspace = useDeleteWorkspace();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;

    try {
      await deleteWorkspace.mutateAsync(workspaceId);
      toast.success('Workspace deleted successfully');
      router.push('/dashboard/workspaces');
    } catch {
      toast.error('Failed to delete workspace');
    }
  };

  if (loadingWorkspace) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!workspace) {
    return <div>Workspace not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => router.push('/dashboard/workspaces')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {workspace.cover_image ? (
              <img
                src={workspace.cover_image}
                alt={workspace.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-lg text-3xl font-bold text-white"
                style={{ backgroundColor: workspace.icon_color }}
              >
                {workspace.icon || workspace.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{workspace.name}</h1>
              <p className="text-muted-foreground mt-2">
                {workspace.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{workspace.member_count || 0} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{workspace.document_count || 0} documents</span>
                </div>
                <div className="flex items-center gap-1">
                  <LayoutGrid className="h-4 w-4" />
                  <span>{workspace.board_count || 0} boards</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setInviteMemberOpen(true)}>
              <UserPlus className="h-4 w-4" />
              {t('workspace.invite_members')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="boards" className="space-y-6">
          <TabsList>
            <TabsTrigger value="boards" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              {t('workspace.boards')}
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('workspace.documents')}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              {t('workspace.members')}
            </TabsTrigger>
          </TabsList>

          {/* Boards Tab */}
          <TabsContent value="boards" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">{t('board.title')}</h3>
              <Button onClick={() => setCreateBoardOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('board.create_board')}
              </Button>
            </div>

            {boards && boards.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {boards.map((board) => (
                  <Card
                    key={board.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                    onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/boards/${board.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                          style={{ backgroundColor: board.color + '20', color: board.color }}
                        >
                          {board.icon || '📋'}
                        </div>
                        <div>
                          <CardTitle>{board.name}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            {board.description || 'No description'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {board.lists?.length || 0} lists
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center py-16">
                <LayoutGrid className="h-16 w-16 text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">{t('board.no_boards')}</h4>
                <p className="text-muted-foreground mb-4">{t('board.create_first')}</p>
                <Button onClick={() => setCreateBoardOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('board.create_board')}
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">{t('document.title')}</h3>
              <Button
                onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/documents/new`)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('document.new_document')}
              </Button>
            </div>

            {documents && documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{doc.icon || '📄'}</span>
                        <div className="flex-1">
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                          <CardDescription className="text-xs">
                            Last edited {new Date(doc.last_edited_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">{t('document.no_documents')}</h4>
                <p className="text-muted-foreground mb-4">{t('document.create_first')}</p>
                <Button
                  onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/documents/new`)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('document.new_document')}
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">{t('workspace.members')}</h3>
              <Button onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/members`)} className="gap-2">
                <Users className="h-4 w-4" />
                View All Members
              </Button>
            </div>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Click "View All Members" to manage workspace members and permissions</p>
                <Button onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/members`)} variant="outline">
                  Go to Members
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <CreateBoardDialog
        workspaceId={workspaceId}
        open={createBoardOpen}
        onOpenChange={setCreateBoardOpen}
      />
      <InviteMemberDialog
        workspaceId={workspaceId}
        open={inviteMemberOpen}
        onOpenChange={setInviteMemberOpen}
      />
    </div>
  );
}
