export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  actor?: User;
}

export type NotificationType =
  | 'workspace_invite'
  | 'document_shared'
  | 'document_mention'
  | 'comment_added'
  | 'comment_reply'
  | 'task_assigned'
  | 'task_completed'
  | 'workspace_updated'
  | 'board_updated'
  | 'member_joined'
  | 'member_left';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  types: {
    [key in NotificationType]?: {
      email: boolean;
      push: boolean;
      in_app: boolean;
    };
  };
}
