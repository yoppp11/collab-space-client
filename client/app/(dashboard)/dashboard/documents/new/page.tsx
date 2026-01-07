'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, FolderOpen, Loader2, FileText, Sparkles } from 'lucide-react';
import { useCreateDocument } from '@/lib/api/documents';
import { useWorkspaces } from '@/lib/api/workspaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// Loading animation component
const LoadingState = ({ step }: { step: 'creating' | 'loading' | null }) => (
  <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <FileText className="h-10 w-10 text-primary" />
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="text-center space-y-2"
    >
      <h3 className="text-xl font-semibold flex items-center gap-2 justify-center">
        {step === 'creating' && (
          <>
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Creating your document...
          </>
        )}
        {step === 'loading' && (
          <>
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            Loading document...
          </>
        )}
      </h3>
      <p className="text-muted-foreground max-w-md">
        {step === 'creating' 
          ? 'Setting up your new workspace document' 
          : 'Preparing your document editor'}
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="flex gap-2"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  </div>
);
export default function NewDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceIdFromUrl = searchParams.get('workspace');
  
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<'creating' | 'loading' | null>(null);
  const hasAutoCreated = useRef(false);
  
  const { data: workspaces, isLoading: loadingWorkspaces } = useWorkspaces();
  const createDocument = useCreateDocument();

  const handleCreateDocument = useCallback(async (workspaceId: string) => {
    if (isCreating) return;
    setIsCreating(true);
    setCreationStep('creating');
    
    try {
      console.log('Creating document for workspace:', workspaceId);
      const doc = await createDocument.mutateAsync({
        workspace: workspaceId,
        title: 'Untitled Document',
      });
      
      console.log('Document created successfully:', doc);
      
      // Show loading state before navigation
      setCreationStep('loading');
      
      // Small delay to ensure cache is updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to the new document
      if (doc?.id) {
        router.push(`/dashboard/documents/${doc.id}`);
      } else {
        throw new Error('Document ID not returned from server');
      }
    } catch (error) {
      console.error('Document creation error:', error);
      // More detailed error message
      const axiosError = error as { response?: { data?: { error?: { message?: string }; message?: string } } };
      const errorMessage = 
        axiosError.response?.data?.error?.message || 
        axiosError.response?.data?.message || 
        'Failed to create document. Please try again.';
      toast.error(errorMessage);
      setIsCreating(false);
      setCreationStep(null);
    }
  }, [createDocument, router, isCreating]);

  // Auto-create if workspace is provided in URL
  useEffect(() => {
    if (workspaceIdFromUrl && !hasAutoCreated.current && !isCreating) {
      hasAutoCreated.current = true;
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => {
        handleCreateDocument(workspaceIdFromUrl);
      }, 0);
    }
  }, [workspaceIdFromUrl, handleCreateDocument, isCreating]);

  const handleSelectWorkspace = (workspaceId: string) => {
    handleCreateDocument(workspaceId);
  };

  // Show loading if workspace is in URL or document is being created
  if (workspaceIdFromUrl || isCreating) {
    return <LoadingState step={creationStep} />;
  }

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
          onClick={() => router.push('/dashboard/documents')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
        
        <h1 className="text-4xl font-bold tracking-tight">Create New Document</h1>
        <p className="text-muted-foreground mt-2">
          Select a workspace for your new document
        </p>
      </motion.div>

      {/* Workspace Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {loadingWorkspaces ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-8 rounded-lg mb-2" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50 group"
                onClick={() => handleSelectWorkspace(workspace.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xl font-bold text-white shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: workspace.icon_color }}
                    >
                      {workspace.icon || workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-1">{workspace.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {workspace.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {workspace.document_count || 0} documents
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Workspaces Found</h4>
            <p className="text-muted-foreground mb-4">
              Create a workspace first to add documents
            </p>
            <Button onClick={() => router.push('/dashboard/workspaces')}>
              Go to Workspaces
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
