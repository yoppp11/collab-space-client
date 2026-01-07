'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  Send,
  Tag,
  Loader2,
  MoreVertical,
  Trash,
  Edit2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  useCardComments,
  useCreateCardComment,
  useDeleteCardComment,
} from '@/lib/api/workspaces';
import type { Card as CardType } from '@/lib/types/workspace';

interface CardComment {
  id: string;
  author: {
    id: string;
    username?: string;
    email?: string;
    display_name?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    initials?: string;
  };
  text: string;
  images?: string[];
  created_at: string;
  is_resolved?: boolean;
  mentions?: Array<{
    id: string;
    email?: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
  }>;
}

interface CardDetailDialogProps {
  card: CardType;
  workspaceId: string;
  boardId: string;
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (cardId: string, data: Partial<CardType>) => Promise<void>;
  onDelete?: (cardId: string) => Promise<void>;
}

export function CardDetailDialog({
  card,
  workspaceId,
  boardId,
  listId,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: CardDetailDialogProps) {
  const user = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch comments from API
  const { data: comments = [], refetch: refetchComments } = useCardComments(
    workspaceId,
    boardId,
    listId,
    card.id
  );

  const createCommentMutation = useCreateCardComment(
    workspaceId,
    boardId,
    listId,
    card.id
  );

  const deleteCommentMutation = useDeleteCardComment(
    workspaceId,
    boardId,
    listId,
    card.id
  );

  // Sync local state with card prop
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
  }, [card]);

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsLoading(true);
    try {
      await onUpdate(card.id, { title, description });
      setIsEditing(false);
      toast.success('Card updated');
    } catch {
      toast.error('Failed to update card');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    try {
      await onDelete(card.id);
      onOpenChange(false);
      toast.success('Card deleted');
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await createCommentMutation.mutateAsync({
        text: newComment.trim(),
      });
      setNewComment('');
      toast.success('Comment added');
      await refetchComments();
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteCommentMutation.mutateAsync(commentId);
      toast.success('Comment deleted');
      await refetchComments();
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const getAuthorName = (author: CardComment['author']) => {
    // Use display_name from API if available
    if (author.display_name) {
      return author.display_name;
    }
    // Fall back to full_name if available
    if (author.full_name) {
      return author.full_name;
    }
    // Construct name from first/last name
    if (author.first_name || author.last_name) {
      return `${author.first_name || ''} ${author.last_name || ''}`.trim();
    }
    // Use email or username as fallback
    return author.email || author.username || 'Unknown User';
  };

  const getInitials = (author: CardComment['author']) => {
    // Use initials from API if available
    if (author.initials) {
      return author.initials;
    }
    // Generate from first/last name
    if (author.first_name && author.last_name) {
      return `${author.first_name[0]}${author.last_name[0]}`.toUpperCase();
    }
    // Use first two characters of display_name or email
    const name = author.display_name || author.full_name || author.email || author.username;
    if (name && name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
                autoFocus
              />
            ) : (
              <DialogTitle className="text-xl">{card.title}</DialogTitle>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Card'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete Card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Card Details */}
          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Edit2 className="h-4 w-4" />
                Description
              </Label>
              {isEditing ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {card.description || 'No description'}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {card.due_date && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due Date
                  </Label>
                  <p className="text-sm">{new Date(card.due_date).toLocaleDateString()}</p>
                </div>
              )}
              {card.labels && card.labels.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Labels
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {card.labels.map((label, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({comments.length})
            </Label>

            {/* Add Comment Form */}
            <div className="flex gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs">
                  {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <AnimatePresence>
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: CardComment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-3 ${comment.is_resolved ? 'opacity-60' : ''}`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {getAuthorName(comment.author)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), {
                                addSuffix: true,
                              })}
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
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Be the first to comment</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
