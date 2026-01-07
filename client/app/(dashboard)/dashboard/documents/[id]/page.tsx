'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MoreVertical,
  Share2,
  Archive,
  Trash,
  Copy,
  Image as ImageIcon,
  Smile,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocument, useUpdateDocument, useDeleteDocument, useDocumentBlocks } from '@/lib/api/documents';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { DocumentEditor } from '@/components/documents/document-editor';
import { DocumentComments } from '@/components/documents/document-comments';
import { ShareDocumentDialog } from '@/components/documents/share-document-dialog';

export default function DocumentDetailPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [localTitle, setLocalTitle] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { data: document, isLoading } = useDocument(documentId);
  const { data: blocks } = useDocumentBlocks(documentId);
  const updateDocument = useUpdateDocument(documentId);
  const deleteDocument = useDeleteDocument();

  // Initialize local title when document loads
  const title = localTitle || document?.title || '';

  const handleTitleChange = async (newTitle: string) => {
    setLocalTitle(newTitle);
    if (newTitle === document?.title) return;

    try {
      await updateDocument.mutateAsync({ title: newTitle });
    } catch {
      toast.error('Failed to update title');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument.mutateAsync(documentId);
      toast.success('Document deleted successfully');
      router.push('/dashboard/documents');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleAddIcon = () => {
    // Emoji picker would go here
    toast.info('Emoji picker coming soon!');
  };

  const handleAddCover = () => {
    // Cover image picker would go here
    toast.info('Cover image picker coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Loading Header */}
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between p-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Title skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>

            {/* Content skeletons */}
            <div className="space-y-4 mt-12">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/5" />
              <div className="py-4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-5/6" />
              <div className="py-4" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-2">Document not found</h2>
        <Button onClick={() => router.push('/dashboard/documents')} className="mt-4">
          {t('back')} to Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
      >
        <div className="flex items-center justify-between p-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/documents')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{document.created_by?.first_name || document.created_by?.username}</span>
              <span>/</span>
              <span className="font-medium text-foreground">
                {document.title || t('document.untitled')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4" />
              Comments
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              {t('document.share')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/documents/${documentId}/history`)}>
                  <Clock className="mr-2 h-4 w-4" />
                  Version History
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('document.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  {t('document.archive')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Document Content */}
      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`flex-1 ${showComments ? 'pr-4' : ''}`}
        >
          <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Cover Image */}
            {document.cover_image ? (
              <div className="relative h-64 -mx-8 mb-12 rounded-lg overflow-hidden group">
                <img
                  src={document.cover_image}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `50% ${document.cover_position * 100}%` }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm">
                    Change Cover
                  </Button>
                  <Button variant="secondary" size="sm">
                    Reposition
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-8 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleAddCover}>
                  <ImageIcon className="h-4 w-4" />
                  {t('document.add_cover')}
                </Button>
              </div>
            )}

            {/* Icon and Title */}
            <div className="mb-8">
              {document.icon ? (
                <button
                  onClick={handleAddIcon}
                  className="text-6xl mb-4 hover:bg-accent rounded-lg p-2 transition-colors"
                >
                  {document.icon}
                </button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 mb-4 opacity-0 hover:opacity-100"
                  onClick={handleAddIcon}
                >
                  <Smile className="h-4 w-4" />
                  {t('document.add_icon')}
                </Button>
              )}

              <Input
                value={title}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={(e) => handleTitleChange(e.target.value)}
                placeholder={t('document.untitled')}
                className="text-5xl font-bold border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              />
            </div>

            {/* Document Editor */}
            <DocumentEditor documentId={documentId} blocks={blocks || []} />
          </div>
        </motion.div>

        {/* Comments Sidebar */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="w-96 border-l bg-muted/10"
          >
            <DocumentComments documentId={documentId} />
          </motion.div>
        )}
      </div>

      <ShareDocumentDialog
        documentId={documentId}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
}
