'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Reply, CheckCircle, Loader2, MoreVertical, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCreateComment, useResolveComment, useDocumentComments } from '@/lib/api/documents';
import type { Comment } from '@/lib/types/document';

interface CommentItemProps {
  comment: Comment;
  documentId: string;
  onReply?: (commentId: string) => void;
}

function CommentItem({ comment, documentId, onReply }: CommentItemProps) {
  const resolveComment = useResolveComment(documentId);
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await resolveComment.mutateAsync(comment.id);
    } finally {
      setIsResolving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const authorName = comment.author?.display_name || comment.author?.email || 'Unknown';
  const contentText = typeof comment.content === 'string' 
    ? comment.content 
    : comment.text || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex gap-3 ${comment.is_resolved ? 'opacity-60' : ''}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.author?.avatar} />
        <AvatarFallback className="text-xs">
          {getInitials(authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{authorName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_resolved && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!comment.is_resolved && (
                <DropdownMenuItem onClick={handleResolve} disabled={isResolving}>
                  {isResolving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark as Resolved
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onReply?.(comment.id)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm">{contentText}</p>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
            {comment.replies.map((reply: Comment) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                documentId={documentId}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface CommentSectionProps {
  documentId: string;
  blockId?: string;
}

export function CommentSection({ documentId, blockId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const { data: comments, isLoading } = useDocumentComments(documentId);
  const createComment = useCreateComment(documentId);

  const filteredComments = (comments || []).filter((comment) => {
    if (blockId) {
      return comment.block === blockId;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        content: newComment.trim(),
        block: blockId,
        parent: replyingTo || undefined,
      });
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">Comments</h3>
        {filteredComments.length > 0 && (
          <Badge variant="secondary">{filteredComments.length}</Badge>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {replyingTo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Reply className="h-4 w-4" />
            Replying to comment
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || createComment.isPending}
          >
            {createComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredComments.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                documentId={documentId}
                onReply={setReplyingTo}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No comments yet</p>
          <p className="text-sm">Be the first to comment</p>
        </div>
      )}
    </div>
  );
}
