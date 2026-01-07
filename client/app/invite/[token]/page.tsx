'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Users } from 'lucide-react';
import { useAcceptInvitation } from '@/lib/api/workspaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const acceptInvitation = useAcceptInvitation();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth-required'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Wait for auth to initialize
    if (authLoading) return;

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      setStatus('auth-required');
      return;
    }

    // Accept the invitation
    const accept = async () => {
      try {
        await acceptInvitation.mutateAsync(token);
        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        const errorMessage = err && typeof err === 'object' && 'message' in err 
          ? (err as { message: string }).message 
          : 'Failed to accept invitation';
        setError(errorMessage);
      }
    };

    accept();
  }, [token, isAuthenticated, authLoading]);

  const handleLogin = () => {
    // Store the invite token to redirect back after login
    sessionStorage.setItem('pendingInvite', token);
    router.push(`/login?redirect=/invite/${token}`);
  };

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-[400px]">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium">Processing invitation...</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === 'auth-required') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-[400px]">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
              <CardDescription>
                Please sign in or create an account to accept this invitation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleLogin} className="w-full" size="lg">
                Sign In to Accept
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/register?redirect=/invite/${token}`)}
              >
                Create Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-[400px]">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to the Team!</CardTitle>
              <CardDescription>
                You&apos;ve successfully joined the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/dashboard/workspaces')} 
                className="w-full"
                size="lg"
              >
                Go to Workspaces
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invitation Error</CardTitle>
            <CardDescription>
              {error || 'This invitation may be expired or invalid.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/dashboard/workspaces')} 
              className="w-full"
            >
              Go to Workspaces
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')} 
              className="w-full"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
