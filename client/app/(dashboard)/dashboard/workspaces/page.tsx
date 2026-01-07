'use client';

import { motion } from 'framer-motion';
import { Plus, Users, FileText, LayoutGrid, Search, Link2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useWorkspaces } from '@/lib/api/workspaces';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';
import { JoinWorkspaceDialog } from '@/components/workspaces/join-workspace-dialog';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WorkspacesPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  
  const { data: workspaces, isLoading } = useWorkspaces();

  const filteredWorkspaces = Array.isArray(workspaces) 
    ? workspaces.filter((workspace) =>
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('workspace.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Manage your workspaces and collaborate with your team
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setJoinDialogOpen(true)} size="lg" className="gap-2">
            <Link2 className="h-5 w-5" />
            Join with Code
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            {t('workspace.create_workspace')}
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('search') + ' workspaces...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </motion.div>

      {/* Workspaces Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-8 w-8 rounded-full mb-2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkspaces && filteredWorkspaces.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredWorkspaces.map((workspace) => (
            <motion.div key={workspace.id} variants={item}>
              <Card
                className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
                onClick={() => router.push(`/dashboard/workspaces/${workspace.id}`)}
              >
                {workspace.cover_image && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={workspace.cover_image}
                      alt={workspace.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold text-white shrink-0"
                      style={{ backgroundColor: workspace.icon_color }}
                    >
                      {workspace.icon || workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl line-clamp-1">{workspace.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {workspace.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{workspace.member_count || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{workspace.document_count || 0} docs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <LayoutGrid className="h-4 w-4" />
                      <span>{workspace.board_count || 0} boards</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <LayoutGrid className="h-16 w-16 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {searchQuery ? t('no_results') : t('workspace.no_workspaces')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery
              ? 'Try adjusting your search to find what you\'re looking for'
              : t('workspace.create_first')}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              {t('workspace.create_workspace')}
            </Button>
          )}
        </motion.div>
      )}

      <CreateWorkspaceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <JoinWorkspaceDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
    </div>
  );
}
