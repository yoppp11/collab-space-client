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
  last_edited_by?: User;
  last_edited_at: string;
  state?: Record<string, unknown>;
  current_version: number;
  is_template: boolean;
  is_archived: boolean;
  parent_document?: string;
  created_at: string;
  updated_at: string;
  permissions?: DocumentPermission[];
  block_count?: number;
}

export interface Block {
  id: string;
  document: string;
  parent?: string;
  type: BlockType;
  content: Record<string, unknown>;
  properties: Record<string, unknown>;
  position: number;
  level: number;
  lft: number;
  rght: number;
  tree_id: number;
  created_at: string;
  updated_at: string;
  children?: Block[];
}

export type BlockType =
  | 'text'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bullet_list'
  | 'numbered_list'
  | 'todo'
  | 'toggle'
  | 'quote'
  | 'divider'
  | 'callout'
  | 'code'
  | 'image'
  | 'video'
  | 'file'
  | 'embed'
  | 'table'
  | 'column'
  | 'link_to_page';

export interface DocumentPermission {
  id: string;
  document: string;
  user: User;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  granted_by: User;
  granted_at: string;
}

export interface Comment {
  id: string;
  document: string;
  block?: string;
  parent?: string;
  author: User & { display_name?: string };
  content: string | Record<string, unknown>;
  text?: string;
  is_resolved: boolean;
  resolved_by?: User;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface CreateDocumentInput {
  workspace: string;
  board?: string;
  title?: string;
  icon?: string;
  parent_document?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  icon?: string;
  cover_image?: string;
  cover_position?: number;
  state?: Record<string, unknown>;
}

export interface CreateBlockInput {
  document: string;
  parent?: string;
  type: BlockType;
  content?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  position?: number;
}

export interface UpdateBlockInput {
  type?: BlockType;
  content?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  position?: number;
  parent?: string;
}
