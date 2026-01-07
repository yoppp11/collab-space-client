'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Mail, Link } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShareDocumentDialogProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDocumentDialog({ documentId, open, onOpenChange }: ShareDocumentDialogProps) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'commenter' | 'viewer'>('viewer');

  const shareUrl = `${window.location.origin}/dashboard/documents/${documentId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    // API call would go here
    toast.success(`Invitation sent to ${email}`);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t('document.share')}</DialogTitle>
          <DialogDescription>
            Share this document with others or copy the link.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="gap-2">
              <Link className="h-4 w-4" />
              Copy Link
            </TabsTrigger>
            <TabsTrigger value="invite" className="gap-2">
              <Mail className="h-4 w-4" />
              Invite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={handleCopyLink} className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the document
              </p>
            </div>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Access Level</Label>
              <Select value={role} onValueChange={(val: 'editor' | 'commenter' | 'viewer') => setRole(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div>
                      <div className="font-medium">Can Edit</div>
                      <div className="text-xs text-muted-foreground">
                        Full access to edit the document
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="commenter">
                    <div>
                      <div className="font-medium">Can Comment</div>
                      <div className="text-xs text-muted-foreground">
                        Can add comments but not edit
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div>
                      <div className="font-medium">Can View</div>
                      <div className="text-xs text-muted-foreground">
                        Read-only access
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleInvite} className="w-full">
              Send Invitation
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
