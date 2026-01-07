import apiClient from './client';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        console.info('rikues')
      const response = await apiClient.post('/auth/login/', credentials);
      // Django returns { user, access, refresh }
      return response.data;
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    }
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/register/', data);
      // Django returns { success, data: { user, tokens: { access, refresh } } }
      if (response.data.success && response.data.data) {
        return {
          user: response.data.data.user,
          access: response.data.data.tokens.access,
          refresh: response.data.data.tokens.refresh,
        };
      }
      return response.data;
    } catch (error) {
      console.error('Register API Error:', error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout/');
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const response = await apiClient.post('/auth/token/refresh/', { refresh });
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch('/auth/profile/', data);
    return response.data;
  },

  // Update avatar
  updateAvatar: async (avatarUrl: string): Promise<{ avatar: string }> => {
    const response = await apiClient.post('/auth/profile/avatar/', { avatar_url: avatarUrl });
    return response.data.data || response.data;
  },

  // Change password
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/password/change/', data);
    return response.data;
  },
};
