// User types
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  cover_image?: string;
  owner: User;
  settings?: Record<string, unknown>;
  is_personal: boolean;
  created_at: string;
  updated_at: string;
}

// Document types
export interface Document {
  id: string;
  workspace: string;
  board?: string;
  board_list?: string;
  title: string;
  icon?: string;
  cover_image?: string;
  cover_position: number;
  created_by: User;
  last_edited_by: User;
  last_edited_at: string;
  state?: Record<string, unknown>;
  current_version: number;
  is_template: boolean;
  is_locked: boolean;
  is_public: boolean;
  tags?: string[];
  position: number;
  due_date?: string;
  properties?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Board types
export interface Board {
  id: string;
  workspace: string;
  name: string;
  description?: string;
  icon?: string;
  view_type: 'board' | 'table' | 'calendar' | 'timeline';
  settings?: Record<string, unknown>;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BoardList {
  id: string;
  board: string;
  name: string;
  position: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
