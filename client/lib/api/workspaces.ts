import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import {
  Workspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  Board,
  CreateBoardInput,
  InviteMemberInput,
  WorkspaceMembership,
} from '../types/workspace';

// Workspace Queries
export const useWorkspaces = () => {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await apiClient.get('/workspaces/');
      // Handle various API response formats
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
  });
};

export const useWorkspace = (id: string) => {
  return useQuery<Workspace>({
    queryKey: ['workspaces', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workspaces/${id}/`);
      return data;
    },
    enabled: !!id,
  });
};

export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery<WorkspaceMembership[]>({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/members/`);
      // Handle various API response formats
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    enabled: !!workspaceId,
  });
};

// Workspace Mutations
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) => {
      const { data } = await apiClient.post('/workspaces/', input);
      // Handle wrapped response { success: true, data: {...} }
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useUpdateWorkspace = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateWorkspaceInput) => {
      const { data } = await apiClient.patch(`/workspaces/${id}/`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', id] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/workspaces/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useInviteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InviteMemberInput) => {
      const { data } = await apiClient.post(
        `/workspaces/${workspaceId}/invite/`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });
    },
  });
};

export const useGenerateInviteLink = (workspaceId: string) => {
  return useMutation({
    mutationFn: async (input: { role: 'admin' | 'member' | 'guest' }) => {
      const { data } = await apiClient.post(
        `/workspaces/${workspaceId}/generate-invite-link/`,
        input
      );
      return data;
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await apiClient.post(
        `/workspaces/invitations/${token}/accept/`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useJoinWorkspaceByCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await apiClient.post('/workspaces/join/', { code });
      // Handle wrapped response { success: true, data: {...} }
      return data?.data ? data : data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      // Set the workspace data in cache immediately
      if (data?.workspace) {
        queryClient.setQueryData(['workspaces', data.workspace.id], data.workspace);
      }
    },
  });
};

export const useRemoveMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });
    },
  });
};

// Board Queries
export const useBoards = (workspaceId: string) => {
  return useQuery<Board[]>({
    queryKey: ['workspaces', workspaceId, 'boards'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/boards/`);
      // Handle various API response formats
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    enabled: !!workspaceId,
  });
};

export const useBoard = (workspaceId: string, boardId: string) => {
  return useQuery<Board>({
    queryKey: ['workspaces', workspaceId, 'boards', boardId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/workspaces/${workspaceId}/boards/${boardId}/`
      );
      return data?.data || data;
    },
    enabled: !!workspaceId && !!boardId,
  });
};

// Board Mutations
export const useCreateBoard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBoardInput) => {
      const { data } = await apiClient.post(
        `/workspaces/${workspaceId}/boards/`,
        input
      );
      // Handle wrapped response { success: true, data: {...} }
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards'],
      });
    },
  });
};

export const useUpdateBoard = (workspaceId: string, boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<CreateBoardInput>) => {
      const { data } = await apiClient.patch(
        `/workspaces/${workspaceId}/boards/${boardId}/`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards'],
      });
    },
  });
};

export const useDeleteBoard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: string) => {
      await apiClient.delete(`/workspaces/${workspaceId}/boards/${boardId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards'],
      });
    },
  });
};

// Board List Mutations
export const useCreateBoardList = (workspaceId: string, boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; color?: string }) => {
      const { data } = await apiClient.post(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/`,
        input
      );
      return data?.data || data;
    },
    onSuccess: async () => {
      // Use refetchQueries to ensure data is immediately refreshed
      await queryClient.refetchQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId],
      });
    },
  });
};

export const useDeleteBoardList = (workspaceId: string, boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      await apiClient.delete(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/`
      );
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId],
      });
    },
  });
};

// Card Mutations
export const useCreateCard = (workspaceId: string, boardId: string, listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { title: string; description?: string }) => {
      const { data } = await apiClient.post(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/`,
        input
      );
      return data?.data || data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId],
      });
    },
  });
};

export const useUpdateCard = (
  workspaceId: string,
  boardId: string,
  listId: string,
  cardId: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { title?: string; description?: string; color?: string }) => {
      const { data } = await apiClient.patch(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}/`,
        input
      );
      return data?.data || data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId],
      });
    },
  });
};

export const useDeleteCard = (workspaceId: string, boardId: string, listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardId: string) => {
      await apiClient.delete(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}/`
      );
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId],
      });
    },
  });
};

// Card Comments Queries
export const useCardComments = (
  workspaceId: string,
  boardId: string,
  listId: string,
  cardId: string
) => {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'boards', boardId, 'cards', cardId, 'comments'],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/`
      );
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    enabled: !!workspaceId && !!boardId && !!listId && !!cardId,
  });
};

// Card Comments Mutations
export const useCreateCardComment = (
  workspaceId: string,
  boardId: string,
  listId: string,
  cardId: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { text: string; mention_ids?: string[]; parent?: string }) => {
      const { data } = await apiClient.post(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/`,
        input
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId, 'cards', cardId, 'comments'],
      });
    },
  });
};

export const useUpdateCardComment = (
  workspaceId: string,
  boardId: string,
  listId: string,
  cardId: string,
  commentId: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { text?: string; mention_ids?: string[] }) => {
      const { data } = await apiClient.patch(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}/`,
        input
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId, 'cards', cardId, 'comments'],
      });
    },
  });
};

export const useDeleteCardComment = (
  workspaceId: string,
  boardId: string,
  listId: string,
  cardId: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await apiClient.delete(
        `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}/`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards', boardId, 'cards', cardId, 'comments'],
      });
    },
  });
};
