'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Copy, Check, Link2, RefreshCw } from 'lucide-react';
import { useGenerateInviteLink } from '@/lib/api/workspaces';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InviteMemberDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ workspaceId, open, onOpenChange }: InviteMemberDialogProps) {
  const { t } = useTranslation('common');
  const generateInviteLink = useGenerateInviteLink(workspaceId);
  
  const [role, setRole] = useState<'admin' | 'member' | 'guest'>('member');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    try {
      const result = await generateInviteLink.mutateAsync({ role });
      const data = result?.data || result;
      
      // Build invite link from the frontend URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const token = data?.token;
      
      if (token) {
        setInviteLink(`${baseUrl}/invite/${token}`);
        setInviteCode(token);
        toast.success('Invite link generated!');
      }
    } catch {
      toast.error('Failed to generate invite link');
    }
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setInviteLink(null);
    setInviteCode(null);
    setCopied(false);
    setRole('member');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {t('workspace.invite_members')}
          </DialogTitle>
          <DialogDescription>
            Generate an invite link to share with team members. Anyone with the link can join this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role for new members</Label>
            <Select
              value={role}
              onValueChange={(value: 'admin' | 'member' | 'guest') => {
                setRole(value);
                setInviteLink(null);
                setInviteCode(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Full access to workspace settings
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div className="flex flex-col">
                    <span className="font-medium">Member</span>
                    <span className="text-xs text-muted-foreground">
                      Can create and edit documents
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="guest">
                  <div className="flex flex-col">
                    <span className="font-medium">Guest</span>
                    <span className="text-xs text-muted-foreground">
                      Limited access to specific documents
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          {!inviteLink && (
            <Button 
              onClick={handleGenerateLink} 
              disabled={generateInviteLink.isPending}
              className="w-full"
            >
              {generateInviteLink.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Generate Invite Link
                </>
              )}
            </Button>
          )}

          {/* Invite Link Display */}
          {inviteLink && (
            <div className="space-y-4">
              {/* Invite Link */}
              <div className="space-y-2">
                <Label>Invite Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Invite Code */}
              <div className="space-y-2">
                <Label>Invite Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteCode || ''}
                    readOnly
                    className="font-mono text-sm tracking-wider"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Info */}
              <p className="text-sm text-muted-foreground">
                This link expires in 7 days. Share it with people you want to invite.
              </p>

              {/* Generate New Link */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setInviteLink(null);
                  setInviteCode(null);
                  handleGenerateLink();
                }}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Link
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
