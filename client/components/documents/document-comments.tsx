'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useDocumentComments, useCreateComment } from '@/lib/api/documents';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentCommentsProps {
  documentId: string;
}

export function DocumentComments({ documentId }: DocumentCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const { data: comments, isLoading } = useDocumentComments(documentId);
  const createComment = useCreateComment(documentId);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({ content: newComment });
      setNewComment('');
    } catch {
      console.error('Failed to create comment');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">Comments</h3>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <img
                      src={comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.username}`}
                      alt={comment.author.username}
                    />
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {comment.author.display_name || comment.author.first_name || comment.author.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  {typeof comment.content === 'string' ? comment.content : comment.text || ''}
                </div>
                {comment.is_resolved && (
                  <div className="text-xs text-muted-foreground">
                    ✓ Resolved by {comment.resolved_by?.first_name || comment.resolved_by?.username}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <p>No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment!</p>
          </div>
        )}
      </ScrollArea>

      {/* New Comment Input */}
      <div className="p-4 border-t space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="resize-none"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          {newComment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewComment('')}
            >
              Clear
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newComment.trim() || createComment.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
