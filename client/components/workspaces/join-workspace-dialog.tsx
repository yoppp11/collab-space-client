'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useJoinWorkspaceByCode } from '@/lib/api/workspaces';

interface JoinWorkspaceDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JoinWorkspaceDialog({ trigger, open, onOpenChange }: JoinWorkspaceDialogProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [workspaceName, setWorkspaceName] = useState('');
  const joinWorkspace = useJoinWorkspaceByCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus('loading');
    try {
      const result = await joinWorkspace.mutateAsync(code.trim());
      // Handle both wrapped and direct responses
      const workspace = result?.data?.workspace || result?.workspace;
      const workspaceName = workspace?.name || 'Workspace';
      const workspaceId = workspace?.id;
      
      setWorkspaceName(workspaceName);
      setStatus('success');
      toast.success(`Successfully joined ${workspaceName}!`);
      
      // Redirect to the workspace after a short delay
      setTimeout(() => {
        onOpenChange?.(false);
        if (workspaceId) {
          router.push(`/dashboard/workspaces/${workspaceId}`);
        } else {
          router.push('/dashboard/workspaces');
        }
      }, 1500);
    } catch (err: unknown) {
      console.error('Join workspace error:', err);
      setStatus('error');
      const error = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      const errorMessage = 
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Invalid or expired invite code';
      toast.error(errorMessage);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setCode('');
      setStatus('idle');
      setWorkspaceName('');
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Join a Workspace
          </DialogTitle>
          <DialogDescription>
            Enter the invite code you received to join a workspace.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Welcome!</h3>
                <p className="text-muted-foreground">
                  You&apos;ve joined <span className="font-medium">{workspaceName}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-4 pt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  placeholder="Paste your invite code here..."
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setStatus('idle');
                  }}
                  className={status === 'error' ? 'border-destructive' : ''}
                  disabled={status === 'loading'}
                />
                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Invalid or expired invite code
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  The invite code is usually a long string of letters and numbers.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={status === 'loading'}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!code.trim() || status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Workspace'
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
