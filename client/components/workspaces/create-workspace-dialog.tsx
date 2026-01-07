'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCreateWorkspace } from '@/lib/api/workspaces';
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
import { CreateWorkspaceInput } from '@/lib/types/workspace';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ICON_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const { t } = useTranslation('common');
  const [selectedColor, setSelectedColor] = useState(ICON_COLORS[0]);
  const createWorkspace = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>();

  const onSubmit = async (data: CreateWorkspaceInput) => {
    try {
      await createWorkspace.mutateAsync({
        ...data,
        icon_color: selectedColor,
      });
      toast.success('Workspace created successfully!');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create workspace');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('workspace.create_workspace')}</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your documents and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Workspace Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('workspace.workspace_name')}</Label>
              <Input
                id="name"
                placeholder="My Awesome Workspace"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('workspace.workspace_description')}</Label>
              <Textarea
                id="description"
                placeholder="A brief description of your workspace..."
                rows={3}
                {...register('description')}
              />
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">{t('workspace.workspace_icon')}</Label>
              <Input
                id="icon"
                placeholder="🚀"
                maxLength={2}
                {...register('icon')}
              />
              <p className="text-xs text-muted-foreground">
                Use an emoji or leave blank for the first letter
              </p>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>{t('workspace.workspace_color')}</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_COLORS.map((color) => (
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
            <Button type="submit" disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? t('loading') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
