export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  icon_color: string;
  cover_image?: string;
  owner: User;
  is_public: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  member_count?: number;
  document_count?: number;
  board_count?: number;
}

export interface WorkspaceMembership {
  id: string;
  workspace: string;
  user: User;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joined_at: string;
  permissions: string[];
}

export interface Card {
  id: string;
  list: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  color?: string;
  due_date?: string;
  position: number;
  labels?: string[];
  assignees?: User[];
  cover_image?: string;
  is_archived?: boolean;
  comment_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BoardList {
  id: string;
  board: string;
  name: string;
  position: number;
  color?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done' | 'custom';
  wip_limit?: number;
  card_count?: number;
  cards?: Card[];
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  workspace: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  position: number;
  settings: Record<string, unknown>;
  lists?: BoardList[];
  created_at: string;
  updated_at: string;
  list_count?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  icon?: string;
  icon_color?: string;
  is_public?: boolean;
  settings?: Record<string, unknown>;
}

export interface UpdateWorkspaceInput extends Partial<CreateWorkspaceInput> {
  slug?: string;
}

export interface CreateBoardInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  settings?: Record<string, unknown>;
}

export interface InviteMemberInput {
  email: string;
  role: 'admin' | 'member' | 'guest';
}
