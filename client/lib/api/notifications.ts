import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { Notification, NotificationPreferences } from '../types/notification';

// Notification Queries
export const useNotifications = (filters?: { unread?: boolean; limit?: number }) => {
  return useQuery<Notification[]>({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.unread) params.append('unread', 'true');
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const { data } = await apiClient.get(`/notifications/?${params.toString()}`);
      // Handle various API response formats
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
  });
};

export const useNotification = (id: string) => {
  const queryClient = useQueryClient();
  
  return useQuery<Notification>({
    queryKey: ['notifications', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/notifications/${id}/`);
      // Automatically mark as read when retrieved
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notifications/unread_count/');
      return data?.count ?? data ?? 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useNotificationPreferences = () => {
  return useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notifications/preferences/');
      return data;
    },
  });
};

// Notification Mutations
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.post(`/notifications/${notificationId}/mark_read/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/notifications/mark_all_read/');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data } = await apiClient.patch('/notifications/preferences/', preferences);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
};
