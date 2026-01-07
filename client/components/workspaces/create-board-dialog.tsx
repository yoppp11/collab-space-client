'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCreateBoard } from '@/lib/api/workspaces';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CreateBoardInput } from '@/lib/types/workspace';

interface CreateBoardDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

export function CreateBoardDialog({ workspaceId, open, onOpenChange }: CreateBoardDialogProps) {
  const { t } = useTranslation('common');
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const createBoard = useCreateBoard(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardInput>();

  const onSubmit = async (data: CreateBoardInput) => {
    try {
      await createBoard.mutateAsync({
        ...data,
        color: selectedColor,
      });
      toast.success('Board created successfully!');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create board');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('board.create_board')}</DialogTitle>
          <DialogDescription>
            Create a new board to organize tasks and manage projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Board Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('board.board_name')}</Label>
              <Input
                id="name"
                placeholder="Project Roadmap"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('board.board_description')}</Label>
              <Textarea
                id="description"
                placeholder="A brief description of your board..."
                rows={3}
                {...register('description')}
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                placeholder="📋"
                maxLength={2}
                {...register('icon')}
              />
              <p className="text-xs text-muted-foreground">
                Use an emoji or leave blank
              </p>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-lg transition-all hover:scale-110 ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={createBoard.isPending}>
              {createBoard.isPending ? t('loading') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
