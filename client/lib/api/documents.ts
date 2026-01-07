import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import {
  Document,
  CreateDocumentInput,
  UpdateDocumentInput,
  Block,
  CreateBlockInput,
  UpdateBlockInput,
  Comment,
  DocumentPermission,
} from '../types/document';

// Document Queries
export const useDocuments = (workspaceId?: string, boardId?: string) => {
  return useQuery<Document[]>({
    queryKey: ['documents', workspaceId, boardId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspace', workspaceId);
      if (boardId) params.append('board', boardId);
      
      const { data } = await apiClient.get(`/documents/?${params.toString()}`);
      // Handle various API response formats
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
  });
};

export const useDocument = (id: string) => {
  return useQuery<Document>({
    queryKey: ['documents', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/documents/${id}/`);
      return data;
    },
    enabled: !!id,
  });
};

export const useDocumentBlocks = (documentId: string) => {
  return useQuery<Block[]>({
    queryKey: ['documents', documentId, 'blocks'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/documents/${documentId}/blocks/`);
      // Handle various API response formats
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    enabled: !!documentId,
  });
};

export const useDocumentComments = (documentId: string) => {
  return useQuery<Comment[]>({
    queryKey: ['documents', documentId, 'comments'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/documents/${documentId}/comments/`);
      // Handle various API response formats
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    enabled: !!documentId,
  });
};

export const useDocumentPermissions = (documentId: string) => {
  return useQuery<DocumentPermission[]>({
    queryKey: ['documents', documentId, 'permissions'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/documents/${documentId}/permissions/`);
      // Handle various API response formats
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    enabled: !!documentId,
  });
};

// Document Mutations
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDocumentInput) => {
      console.log('Sending document creation request:', input);
      const { data } = await apiClient.post('/documents/', input);
      console.log('Document creation response:', data);
      // Handle wrapped response { success: true, data: {...} }
      const document = data?.data || data;
      if (!document?.id) {
        console.error('Invalid document response:', data);
        throw new Error('Invalid response from server: missing document ID');
      }
      return document;
    },
    onSuccess: (newDocument, variables) => {
      console.log('Document created, updating cache:', newDocument);
      // Immediately set the new document in cache to avoid loading delay
      queryClient.setQueryData(['documents', newDocument.id], newDocument);
      
      // Invalidate document lists to refresh them
      queryClient.invalidateQueries({
        queryKey: ['documents', variables.workspace],
      });
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
    },
    onError: (error) => {
      console.error('Document creation mutation error:', error);
    },
  });
};

export const useUpdateDocument = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDocumentInput) => {
      const { data } = await apiClient.patch(`/documents/${id}/`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/documents/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

// Block Mutations
export const useCreateBlock = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBlockInput) => {
      const { data } = await apiClient.post(`/blocks/`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId, 'blocks'],
      });
    },
  });
};

export const useUpdateBlock = (documentId: string, blockId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBlockInput) => {
      const { data } = await apiClient.patch(`/blocks/${blockId}/`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId, 'blocks'],
      });
    },
  });
};

export const useDeleteBlock = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockId: string) => {
      await apiClient.delete(`/blocks/${blockId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId, 'blocks'],
      });
    },
  });
};

// Comment Mutations
export const useCreateComment = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { content: string; block?: string; parent?: string }) => {
      const { data } = await apiClient.post('/comments/', {
        ...input,
        document: documentId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId, 'comments'],
      });
    },
  });
};

export const useResolveComment = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await apiClient.post(`/comments/${commentId}/resolve/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId, 'comments'],
      });
    },
  });
};
