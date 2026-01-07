'use client';

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Trash,
  X,
  Calendar,
  Tag,
  MessageSquare,
  Users,
  GripVertical,
} from 'lucide-react';
import {
  useBoard,
  useCreateBoardList,
  useCreateCard,
  useDeleteBoardList,
  useDeleteCard,
} from '@/lib/api/workspaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { CardDetailDialog } from '@/components/workspaces/card-detail-dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BoardList as BoardListType, Card as CardType } from '@/lib/types/workspace';

interface AddCardFormProps {
  listId: string;
  workspaceId: string;
  boardId: string;
  onCancel: () => void;
  onSuccess: (card: CardType) => void;
}

function AddCardForm({ listId, workspaceId, boardId, onCancel, onSuccess }: AddCardFormProps) {
  const [title, setTitle] = useState('');
  const createCard = useCreateCard(workspaceId, boardId, listId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newCard = await createCard.mutateAsync({ title: title.trim() });
      toast.success('Card created!');
      setTitle('');
      onSuccess(newCard);
    } catch {
      toast.error('Failed to create card');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-background p-2 rounded-lg border">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a title for this card..."
        autoFocus
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7" disabled={createCard.isPending || !title.trim()}>
          {createCard.isPending ? 'Adding...' : 'Add Card'}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

interface AddListFormProps {
  workspaceId: string;
  boardId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

function AddListForm({ workspaceId, boardId, onCancel, onSuccess }: AddListFormProps) {
  const [name, setName] = useState('');
  const createList = useCreateBoardList(workspaceId, boardId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createList.mutateAsync({ name: name.trim() });
      toast.success('List created!');
      setName('');
      onSuccess();
    } catch {
      toast.error('Failed to create list');
    }
  };

  return (
    <Card className="w-80 shrink-0 bg-muted/50">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter list title..."
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={createList.isPending || !name.trim()}>
              {createList.isPending ? 'Adding...' : 'Add List'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface BoardListCardProps {
  list: BoardListType;
  workspaceId: string;
  boardId: string;
}

function BoardListCard({ list, workspaceId, boardId }: BoardListCardProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [cards, setCards] = useState<CardType[]>(list.cards || []);
  const deleteList = useDeleteBoardList(workspaceId, boardId);
  const deleteCard = useDeleteCard(workspaceId, boardId, list.id);

  const handleDeleteList = async () => {
    if (!confirm('Are you sure you want to delete this list?')) return;
    try {
      await deleteList.mutateAsync(list.id);
      toast.success('List deleted!');
    } catch {
      toast.error('Failed to delete list');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard.mutateAsync(cardId);
      setCards(cards.filter(c => c.id !== cardId));
      toast.success('Card deleted!');
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
  };

  const handleCardUpdate = async (cardId: string, data: Partial<CardType>) => {
    // Update local state optimistically
    setCards(cards.map(c => c.id === cardId ? { ...c, ...data } : c));
    // TODO: Call API to update card
  };

  const handleCardDelete = async (cardId: string) => {
    await handleDeleteCard(cardId);
    setSelectedCard(null);
  };

  const handleCardCreated = (newCard: CardType) => {
    setCards([...cards, newCard]);
    setIsAddingCard(false);
  };

  const getCardColor = (card: CardType) => {
    if (card.color) return card.color;
    // Default colors based on due date
    if (card.due_date) {
      const dueDate = new Date(card.due_date);
      const now = new Date();
      if (dueDate < now) return '#ef4444'; // Red - overdue
      if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return '#f59e0b'; // Yellow - due soon
    }
    return undefined;
  };

  return (
    <>
      <Card className="w-80 shrink-0 h-fit max-h-[calc(100vh-250px)] flex flex-col bg-muted/30 border-muted">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-3 pt-3 shrink-0">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <CardTitle className="text-sm font-medium">{list.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {cards.length}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsAddingCard(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDeleteList}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-2 overflow-y-auto flex-1 px-2 pb-2">
          <AnimatePresence>
            {cards.map((card: CardType) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-background border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all relative"
                onClick={() => handleCardClick(card)}
                style={{
                  borderLeftWidth: card.color ? '4px' : undefined,
                  borderLeftColor: getCardColor(card),
                }}
              >
                {/* Card Labels */}
                {card.labels && card.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {card.labels.slice(0, 3).map((label, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs h-5 px-1.5"
                      >
                        {label}
                      </Badge>
                    ))}
                    {card.labels.length > 3 && (
                      <Badge variant="secondary" className="text-xs h-5 px-1.5">
                        +{card.labels.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Card Status Badge */}
                {card.status && card.status !== 'todo' && (
                  <div className="mb-2">
                    <Badge 
                      variant="outline"
                      className={`text-xs h-5 px-1.5 ${
                        card.status === 'done' ? 'bg-green-100 text-green-800 border-green-300' :
                        card.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        card.status === 'review' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        card.status === 'blocked' ? 'bg-red-100 text-red-800 border-red-300' :
                        ''
                      }`}
                    >
                      {card.status === 'in_progress' ? 'In Progress' :
                       card.status === 'review' ? 'In Review' :
                       card.status === 'done' ? 'Done' :
                       card.status === 'blocked' ? 'Blocked' :
                       card.status}
                    </Badge>
                  </div>
                )}

                {/* Card Title */}
                <h4 className="font-medium text-sm pr-6">{card.title}</h4>

                {/* Card Description Preview */}
                {card.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {card.description}
                  </p>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {card.due_date && (
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(card.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      {card.comment_count || 0}
                    </div>
                  </div>

                  {/* Assignees */}
                  {card.assignees && card.assignees.length > 0 && (
                    <div className="flex -space-x-2">
                      {card.assignees.slice(0, 3).map((assignee) => (
                        <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {assignee.first_name?.[0] || assignee.email?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {card.assignees.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                          +{card.assignees.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {isAddingCard ? (
            <AddCardForm
              listId={list.id}
              workspaceId={workspaceId}
              boardId={boardId}
              onCancel={() => setIsAddingCard(false)}
              onSuccess={handleCardCreated}
            />
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground h-8"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="h-4 w-4" />
              Add a card
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Card Detail Dialog */}
      {selectedCard && (
        <CardDetailDialog
          card={selectedCard}
          workspaceId={workspaceId}
          boardId={boardId}
          listId={list.id}
          open={!!selectedCard}
          onOpenChange={(open) => !open && setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}
    </>
  );
}

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.id as string;
  const boardId = params.boardId as string;
  const [isAddingList, setIsAddingList] = useState(false);

  const { data: board, isLoading } = useBoard(workspaceId, boardId);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-96" />
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-80 shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-semibold">Board not found</h2>
        <Button onClick={() => router.push(`/dashboard/workspaces/${workspaceId}`)}>
          Back to Workspace
        </Button>
      </div>
    );
  }

  const lists = board.lists || [];

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
          onClick={() => router.push(`/dashboard/workspaces/${workspaceId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
              style={{ backgroundColor: board.color + '20', color: board.color }}
            >
              {board.icon || '📋'}
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{board.name}</h1>
              <p className="text-muted-foreground mt-1">
                {board.description || 'No description'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={() => setIsAddingList(true)}>
              <Plus className="h-4 w-4" />
              Add List
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Board</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Board Lists */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-4 overflow-x-auto pb-4"
      >
        <AnimatePresence>
          {lists.map((list: BoardListType) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <BoardListCard
                list={list}
                workspaceId={workspaceId}
                boardId={boardId}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add List */}
        {isAddingList ? (
          <AddListForm
            workspaceId={workspaceId}
            boardId={boardId}
            onCancel={() => setIsAddingList(false)}
            onSuccess={() => setIsAddingList(false)}
          />
        ) : (
          <Card
            className="w-80 shrink-0 bg-muted/50 border-dashed cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => setIsAddingList(true)}
          >
            <CardContent className="pt-6">
              <Button variant="ghost" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add another list
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
